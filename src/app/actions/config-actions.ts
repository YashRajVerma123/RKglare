
'use server';

import { firebaseConfig } from "@/lib/firebase";

export async function getClientFirebaseConfig() {
    // Only return the properties that are safe to be public.
    // This action ensures that sensitive server-side keys are not exposed.
    return {
        apiKey: firebaseConfig.apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
        measurementId: firebaseConfig.measurementId,
    };
}

