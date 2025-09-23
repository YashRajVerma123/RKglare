
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-server'; // Use server db
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().min(20, 'Bio must be at least 20 characters.'),
  instagramUrl: z.string().url('Please enter a valid Instagram URL.'),
  signature: z.string().min(2, 'Signature must be at least 2 characters.'),
  avatar: z.string().optional(),
  showEmail: z.boolean().optional(),
});

export async function updateAuthorProfile(authorId: string, values: Partial<z.infer<typeof profileSchema>>): Promise<{ success: boolean }> {
  if (!authorId) {
    throw new Error('Author ID is required.');
  }

  const authorRef = doc(db, 'users', authorId);
  
  // Construct object with only defined values to avoid overwriting fields with undefined
  const updateData: { [key: string]: any } = {};
  if (values.name !== undefined) updateData.name = values.name;
  if (values.bio !== undefined) updateData.bio = values.bio;
  if (values.instagramUrl !== undefined) updateData.instagramUrl = values.instagramUrl;
  if (values.signature !== undefined) updateData.signature = values.signature;
  if (values.avatar) updateData.avatar = values.avatar;
  if (values.showEmail !== undefined) updateData.showEmail = values.showEmail;

  if (Object.keys(updateData).length > 0) {
    await updateDoc(authorRef, updateData);
  }

  // Revalidate paths where author info is shown
  revalidatePath('/admin');
  revalidatePath('/posts/.*', 'page'); // Revalidate all post pages
  
  return { success: true };
}
