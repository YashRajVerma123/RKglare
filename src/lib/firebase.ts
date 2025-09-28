// This file is being deprecated in favor of firebase-server.ts and firebase-client.ts
// It is kept for now to avoid breaking existing imports, but should be considered for removal.
// For server-side code, import from '@/lib/firebase-server';
// For client-side code, use the AuthProvider context.

// For simplicity, we will just re-export the server-side instance.
// This assumes any remaining direct import of 'db' is from a server component.
import { db, firebaseConfig } from './firebase-server';


export { db, firebaseConfig };
