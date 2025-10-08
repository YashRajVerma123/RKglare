
'use server'

import { z } from 'zod';
import { revalidateTag, revalidatePath } from 'next/cache';
import { doc, addDoc, collection, deleteDoc, updateDoc, writeBatch, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  date: z.string().min(1, 'Date is required.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  icon: z.string().min(1, 'Please upload an icon.'),
});


export async function addDiaryEntryAction(values: z.infer<typeof formSchema>): Promise<{ success: boolean, error?: string, chapter?: number }> {
    try {
        const diaryCollection = collection(db, 'diary');
        const q = query(diaryCollection, orderBy('chapter', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        
        const nextChapter = snapshot.empty ? 1 : (snapshot.docs[0].data().chapter || 0) + 1;
        
        await addDoc(diaryCollection, {
            ...values,
            chapter: nextChapter,
        });

        revalidateTag('diary');
        revalidatePath('/diary');
        revalidatePath('/admin');

        return { success: true, chapter: nextChapter };

    } catch(e) {
        console.error("Error adding diary entry:", e);
        return { success: false, error: 'A server error occurred while adding the entry.' }
    }
}

export async function deleteDiaryEntryAction(entryId: string): Promise<{ success: boolean, error?: string }> {
    if (!entryId) {
        return { success: false, error: 'Diary entry ID is required.' };
    }
    try {
        await deleteDoc(doc(db, 'diary', entryId));
        
        revalidateTag('diary');
        revalidatePath('/diary');
        revalidatePath('/admin');
        revalidatePath('/diary/[chapter]', 'page');

        return { success: true };
    } catch (e) {
        console.error("Error deleting diary entry: ", e);
        return { success: false, error: "A server error occurred while deleting the entry." };
    }
}
