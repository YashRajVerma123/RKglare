'use server';

import { db } from '@/lib/firebase-server';
import { collection, addDoc, doc, setDoc, query, orderBy, getDocs, Timestamp, writeBatch } from 'firebase/firestore';
import { revalidateTag } from 'next/cache';
import { SupportChatMessage, SupportChatThread, authorConverter } from '@/lib/data';

export async function sendSupportMessage(
    userId: string,
    userName: string,
    userAvatar: string,
    text: string,
    sender: 'user' | 'admin'
): Promise<{ success: boolean; error?: string }> {

    if (!userId || !text) {
        return { success: false, error: 'User ID and message text are required.' };
    }

    try {
        const chatRef = doc(db, 'supportChats', userId);
        const messagesCol = collection(chatRef, 'messages');
        
        await addDoc(messagesCol, {
            userId,
            text,
            sender,
            createdAt: Timestamp.now(),
            readByAdmin: sender === 'admin',
        });

        // Update the main chat document for easy querying of threads
        await setDoc(chatRef, {
            userId,
            userName,
            userAvatar,
            lastMessage: text,
            lastMessageAt: Timestamp.now(),
            hasUnread: sender === 'user',
        }, { merge: true });

        revalidateTag(`support-chat:${userId}`);
        revalidateTag('support-chat-threads');

        return { success: true };

    } catch (error) {
        console.error("Error sending support message:", error);
        return { success: false, error: 'A server error occurred.' };
    }
}

export async function getSupportChatThreads(): Promise<SupportChatThread[]> {
    const threadsCol = collection(db, 'supportChats');
    const q = query(threadsCol, orderBy('lastMessageAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt.toDate().toISOString(),
            hasUnread: data.hasUnread || false,
        };
    });
}

export async function getUserSupportMessages(userId: string): Promise<SupportChatMessage[]> {
    if (!userId) return [];
    
    const messagesCol = collection(db, 'supportChats', userId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            text: data.text,
            sender: data.sender,
            createdAt: data.createdAt.toDate().toISOString(),
            readByAdmin: data.readByAdmin || false,
        };
    });
}

export async function markChatAsRead(userId: string): Promise<{ success: boolean }> {
    const chatRef = doc(db, 'supportChats', userId);
    await setDoc(chatRef, { hasUnread: false }, { merge: true });
    revalidateTag('support-chat-threads');
    return { success: true };
}