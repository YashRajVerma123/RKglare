
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/firebase-server'; // Use server db
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { z } from 'zod';
import { Author, authorConverter } from '@/lib/data';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3).max(15),
  bio: z.string().min(20, 'Bio must be at least 20 characters.').optional().or(z.literal('')),
  instagramUrl: z.string().url('Please enter a valid Instagram URL.').optional().or(z.literal('')),
  signature: z.string().min(2, 'Signature must be at least 2 characters.').optional(),
  avatar: z.string().optional(),
  bannerImage: z.string().optional(),
  showEmail: z.boolean().optional(),
  primaryColor: z.string().optional(),
  font: z.string().optional(),
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
  if (values.primaryColor) updateData.primaryColor = values.primaryColor;
  if (values.font) updateData.font = values.font;

  if (Object.keys(updateData).length > 0) {
    await updateDoc(authorRef, updateData);
  }

  // Revalidate paths where author info is shown
  revalidateTag(`author-id:${authorId}`);
  revalidatePath('/admin');
  revalidatePath('/posts/.*', 'page'); // Revalidate all post pages
  
  return { success: true };
}

const safeToISOString = (date: any): string | null => {
    if (!date) return null;
    if (typeof date.toDate === 'function') { // Firestore Timestamp
        return date.toDate().toISOString();
    }
    if (typeof date === 'string') {
        return date;
    }
    try {
        return new Date(date).toISOString();
    } catch (e) {
        return null;
    }
}

export async function getAuthorProfileAction(authorId: string): Promise<{ success: boolean, author?: Author | null, error?: string }> {
    if (!authorId) {
        return { success: false, error: "Author ID is required." };
    }
    try {
        const authorRef = doc(db, 'users', authorId);
        const docSnap = await getDoc(authorRef.withConverter(authorConverter));

        if (docSnap.exists()) {
            const authorData = docSnap.data();

            // Manually ensure all nested date objects are serialized to strings
            const serializableAuthor: Author = {
                ...authorData,
                premium: authorData.premium ? {
                    ...authorData.premium,
                    expires: safeToISOString(authorData.premium.expires),
                } : { active: false, expires: null },
                streak: authorData.streak ? {
                    ...authorData.streak,
                    lastLoginDate: safeToISOString(authorData.streak.lastLoginDate) || '',
                } : undefined,
                challenge: authorData.challenge ? {
                    ...authorData.challenge,
                    assignedAt: safeToISOString(authorData.challenge.assignedAt) || '',
                } : undefined,
            };

            return { success: true, author: serializableAuthor };
        } else {
            return { success: false, error: "User not found." };
        }
    } catch (e) {
        console.error("Error fetching author profile:", e);
        return { success: false, error: "A server error occurred while fetching the profile." };
    }
}
