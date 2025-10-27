import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "demo",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo"
};

// Initialize Firebase only if not already initialized
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db: Firestore = getFirestore(app);

// Storage is optional - only load if available
let storage: any = null;
try {
  if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET && 
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET !== "demo") {
    const { getStorage } = require('firebase/storage');
    storage = getStorage(app);
  }
} catch (error) {
  console.log('Firebase Storage not available - using base64 images instead');
}

export { storage };
