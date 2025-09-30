'use server'

import { db } from '@/lib/firebase-server';
import { collection, addDoc, Timestamp, deleteDoc, doc, updateDoc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { z } from 'zod';
import { Author, ChatMessage, messageConverter } from '@/lib/data';
import { revalidateTag } from 'next/cache';

const sendMessageSchema = z.object({
  text: z.string().min(1).max(1000),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
  }),
  replyTo: z.object({
      messageId: z.string(),
      authorName: z.string(),
      text: z.string(),
  }).nullable(),
  image: z.string().optional(),
});

export async function sendMessage(
    text: string, 
    author: Pick<Author, 'id' | 'name' | 'avatar'>,
    replyTo: ChatMessage['replyTo'] | null,
    image?: string,
) {
    if (!text && !image) return { error: "Message must contain text or an image." };
    
    const validation = sendMessageSchema.safeParse({ text, author, replyTo, image });

    if (!validation.success) {
        console.error("Invalid message format:", validation.error);
        return { error: "Invalid message format." };
    }

    const messagesCollection = collection(db, 'premium-chat').withConverter(messageConverter);
    const newDocRef = doc(messagesCollection);
    
    const newMessage: Omit<ChatMessage, 'id'> = {
        text: text || '',
        author,
        replyTo,
        image,
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: {},
    };

    await setDoc(newDocRef, newMessage);

    revalidateTag('premium-chat');
    return { success: true };
}

export async function deleteMessage(messageId: string, userId: string): Promise<{success: boolean, error?: string}> {
    if (!messageId || !userId) {
        return { success: false, error: "Message ID and User ID are required." };
    }
    
    const messageRef = doc(db, 'premium-chat', messageId).withConverter(messageConverter);
    
    try {
       const messageDoc = await getDoc(messageRef);
       if (!messageDoc.exists()) {
           return { success: false, error: "Message not found." };
       }
       if (messageDoc.data().author.id !== userId) {
            return { success: false, error: "You are not authorized to delete this message." };
       }
       
        await deleteDoc(messageRef);
        revalidateTag('premium-chat');
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { success: false, error: "Could not delete message." };
    }
}

export async function editMessage(messageId: string, newText: string, userId: string): Promise<{success: boolean, error?: string}> {
    if (!messageId || !newText.trim() || !userId) {
        return { success: false, error: "Invalid input." };
    }

    const messageRef = doc(db, 'premium-chat', messageId).withConverter(messageConverter);
    
    try {
        const messageDoc = await getDoc(messageRef);
        if (!messageDoc.exists()) {
            return { success: false, error: "Message not found." };
        }
        if (messageDoc.data().author.id !== userId) {
            return { success: false, error: "You are not authorized to edit this message." };
        }

        await updateDoc(messageRef, {
            text: newText,
            isEdited: true,
            updatedAt: Timestamp.now(),
        });

        revalidateTag('premium-chat');
        return { success: true };
    } catch (error) {
        console.error("Error editing message:", error);
        return { success: false, error: "Could not edit message." };
    }
}

export async function toggleReaction(messageId: string, emoji: string, userId: string): Promise<{success: boolean, error?: string}> {
    if (!messageId || !emoji || !userId) {
        return { success: false, error: "Invalid input." };
    }

    const messageRef = doc(db, 'premium-chat', messageId);

    try {
        await runTransaction(db, async (transaction) => {
            const messageDoc = await transaction.get(messageRef);
            if (!messageDoc.exists()) {
                throw new Error("Message not found.");
            }
            
            const data = messageDoc.data();
            const reactions = data.reactions || {};
            const reactionKey = `reactions.${emoji}`;
            
            if (reactions[emoji] && reactions[emoji].includes(userId)) {
                // User is removing their reaction
                const updatedReactors = reactions[emoji].filter((id: string) => id !== userId);
                if (updatedReactors.length === 0) {
                    // If no one is left, remove the emoji key
                    delete reactions[emoji];
                     transaction.update(messageRef, { reactions });
                } else {
                    transaction.update(messageRef, { [reactionKey]: updatedReactors });
                }
            } else {
                // User is adding a new reaction
                 const updatedReactors = reactions[emoji] ? [...reactions[emoji], userId] : [userId];
                 transaction.update(messageRef, { [reactionKey]: updatedReactors });
            }
        });
        
        revalidateTag('premium-chat');
        return { success: true };
    } catch (error) {
        console.error("Error toggling reaction:", error);
        return { success: false, error: "Could not update reactions." };
    }
}
