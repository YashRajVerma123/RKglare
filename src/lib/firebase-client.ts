
// THIS FILE IS FOR CLIENT-SIDE USE ONLY
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;

function initializeClientApp(config: FirebaseOptions) {
  if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  // Hot-reloading in development can cause issues with Firebase.
  // We check if emulators are already running to avoid reconnection errors.
  // @ts-ignore - _isInitialized is not in the type definition but is a reliable internal flag.
  if (process.env.NODE_ENV === 'development' && !auth.emulatorConfig) {
    // connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    // connectFirestoreEmulator(db, 'localhost', 8080);
  }

  return { app, auth, db };
}

// We export a function that can be called with the runtime config
// instead of exporting the initialized instances directly.
export { initializeClientApp };
