import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  RecaptchaVerifier,
  ConfirmationResult,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC11_rraPc7gZdDErWvol1NpJ8Re7bZVQ8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'financesarthi-3e16f.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'financesarthi-3e16f',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'financesarthi-3e16f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1013635972395',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1013635972395:web:f67d50ff5523e6ddde996e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XNRGGKYW37',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firebase initialization note:', e);
  app = getApps()[0] || (initializeApp(firebaseConfig) as any);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Force account selection prompt on Google auth Popup
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Persistence setup
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase persistence warning:', err.message);
  });
}

export const initRecaptcha = (containerId: string): RecaptchaVerifier => {
  if (typeof window === 'undefined' || !auth) return null as any;
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
};

export type { ConfirmationResult };
