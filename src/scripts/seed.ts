
import 'dotenv/config'
import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { initialPostsData, initialNotificationsData, initialBulletinsData } from '../lib/data-store';


const seedCollection = async (collectionPath: string, data: any[], checkField: string) => {
    console.log(`Checking collection: ${collectionPath}...`);
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(collectionRef);

    if (!snapshot.empty) {
        console.log(`Collection is not empty, skipping seeding: ${collectionPath}`);
        return;
    }
    
    console.log(`Seeding collection: ${collectionPath}...`);
    const batch = writeBatch(db);
    data.forEach(itemData => {
        // Use a specific field for the document ID if it makes sense (like a slug for posts)
        const docId = itemData[checkField] ? itemData[checkField].toLowerCase().replace(/\s+/g, '-') : undefined;
        const docRef = docId ? doc(db, collectionPath, docId) : doc(collectionRef);
        
        // Convert date strings to Firestore Timestamps
        const firestoreData = { ...itemData };
        if (firestoreData.publishedAt) {
            firestoreData.publishedAt = new Date(firestoreData.publishedAt);
        }
         if (firestoreData.createdAt) {
            firestoreData.createdAt = new Date(firestoreData.createdAt);
        }

        // Add a default `likes` field to posts if it doesn't exist.
        if (collectionPath === 'posts' && firestoreData.likes === undefined) {
            firestoreData.likes = 0;
        }

        const { comments, ...post } = firestoreData;
        batch.set(docRef, post);

        if (comments) {
            for (const commentData of comments) {
                const commentRef = doc(collection(docRef, 'comments'));
                batch.set(commentRef, { ...commentData, createdAt: new Date(commentData.createdAt) });
            }
        }
    });
    await batch.commit();
    console.log(`Successfully seeded collection: ${collectionPath}`);
}


const seedDatabase = async () => {
    console.log("Starting database seed...");
    try {
        await seedCollection('posts', initialPostsData, 'slug');
        await seedCollection('notifications', initialNotificationsData, 'title');
        await seedCollection('bulletins', initialBulletinsData, 'title');
        console.log("Database seeding finished.");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
