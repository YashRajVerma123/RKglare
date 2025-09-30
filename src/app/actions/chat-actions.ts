
'use server'

import { db } from '@/lib/firebase-server';
import { collection, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { z } from 'zod';
import { Author, messageConverter } from '@/lib/data';

const messageSchema = z.object({
  text: z.string().min(1).max(500),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().url(),
  })
});

export async function sendMessage(text: string, author: Pick<Author, 'id' | 'name' | 'avatar'>) {
    const validation = messageSchema.safeParse({ text, author });

    if (!validation.success) {
        console.error("Invalid message format:", validation.error);
        return { error: "Invalid message format." };
    }

    const messagesCollection = collection(db, 'premium-chat').withConverter(messageConverter);

    await addDoc(messagesCollection, {
        text,
        author,
    });

    return { success: true };
}

export async function deleteMessage(messageId: string): Promise<{success: boolean, error?: string}> {
    if (!messageId) {
        return { success: false, error: "Message ID is required." };
    }
    
    try {
        const messageRef = doc(db, 'premium-chat', messageId);
        await deleteDoc(messageRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { success: false, error: "Could not delete message." };
    }
}
