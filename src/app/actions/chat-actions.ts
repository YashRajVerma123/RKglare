
'use server'

import { db } from '@/lib/firebase-server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
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
