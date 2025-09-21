// This file is being deprecated in favor of firebase-server.ts and firebase-client.ts
// It is kept for now to avoid breaking existing imports, but should be considered for removal.
// For server-side code, import from '@/lib/firebase-server';
// For client-side code, use the AuthProvider context.

// For simplicity, we will just re-export the server-side instance.
// This assumes any remaining direct import of 'db' is from a server component.
import { db } from './firebase-server';
import { FirebaseOptions } from 'firebase/app';

// This config is now only used to pass to the client via server action.
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

export { db };
