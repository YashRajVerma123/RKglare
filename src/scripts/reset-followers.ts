
import 'dotenv/config';
import { db } from '../lib/firebase-server';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const clearSubcollection = async (batch: any, parentDocRef: any, subcollectionName: string) => {
    const subcollectionRef = collection(parentDocRef, subcollectionName);
    const subcollectionSnapshot = await getDocs(subcollectionRef);
    subcollectionSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    console.log(`  - Marked all documents in '${subcollectionName}' for deletion.`);
}

const resetFollowers = async () => {
    console.log("Starting to reset follower and following counts for all users...");
    const usersCollectionRef = collection(db, 'users');
    const batch = writeBatch(db);

    try {
        const usersSnapshot = await getDocs(usersCollectionRef);
        
        if (usersSnapshot.empty) {
            console.log("No users found in the database. Nothing to do.");
            return;
        }
        
        console.log(`Found ${usersSnapshot.docs.length} users. Preparing to reset...`);

        for (const userDoc of usersSnapshot.docs) {
            const userRef = doc(db, 'users', userDoc.id);
            console.log(`Processing user: ${userDoc.id}`);
            
            // 1. Reset follower/following counts to 0
            batch.update(userRef, {
                followers: 0,
                following: 0
            });
            console.log(`  - Marked 'followers' and 'following' counts to be reset to 0.`);

            // 2. Clear 'followers' subcollection
            await clearSubcollection(batch, userRef, 'followers');

            // 3. Clear 'following' subcollection
            await clearSubcollection(batch, userRef, 'following');
        }

        console.log("Committing all changes to the database...");
        await batch.commit();
        console.log("Successfully reset all follower data for all users.");

    } catch (error) {
        console.error("Error resetting follower data:", error);
        process.exit(1);
    }
};

resetFollowers();
