
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-server'; // Use server db
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';
import { Author } from '@/lib/data';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3).max(15),
  bio: z.string().min(20, 'Bio must be at least 20 characters.').optional().or(z.literal('')),
  instagramUrl: z.string().url('Please enter a valid Instagram URL.').optional().or(z.literal('')),
  signature: z.string().min(2, 'Signature must be at least 2 characters.').optional(),
  avatar: z.string().optional(),
  bannerImage: z.string().optional(),
  showEmail: z.boolean().optional(),
  preferences: z.object({
      font: z.enum(['default', 'serif', 'mono']).optional(),
  }).optional(),
});

export async function updateAuthorProfile(authorId: string, values: Partial<z.infer<typeof profileSchema>> & { avatar?: string, bannerImage?: string }): Promise<{ success: boolean }> {
  if (!authorId) {
    throw new Error('Author ID is required.');
  }

  const authorRef = doc(db, 'users', authorId);
  
  // Construct object with only defined values to avoid overwriting fields with undefined
  const updateData: { [key: string]: any } = {};
  if (values.name !== undefined) updateData.name = values.name;
  if (values.username !== undefined) updateData.username = values.username;
  if (values.bio !== undefined) updateData.bio = values.bio;
  if (values.instagramUrl !== undefined) updateData.instagramUrl = values.instagramUrl;
  if (values.signature !== undefined) updateData.signature = values.signature;
  if (values.avatar) updateData.avatar = values.avatar;
  if (values.bannerImage) updateData.bannerImage = values.bannerImage;
  if (values.showEmail !== undefined) updateData.showEmail = values.showEmail;
  if (values.preferences?.font !== undefined) updateData['preferences.font'] = values.preferences.font;

  if (Object.keys(updateData).length > 0) {
    await updateDoc(authorRef, updateData);
  }

  // Revalidate paths where author info is shown
  revalidatePath('/admin');
  revalidatePath('/posts/.*', 'page'); // Revalidate all post pages
  
  return { success: true };
}
