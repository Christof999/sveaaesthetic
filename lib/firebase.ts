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

// Prüfe ob Firebase richtig konfiguriert ist
const isFirebaseConfigured = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo" &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo";

// Initialize Firebase only if properly configured and not already initialized
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('Firebase nicht konfiguriert - verwende Fallback-Modus');
  }
} else {
  console.log('Firebase nicht konfiguriert - verwende Fallback-Modus');
  console.log('Bitte setze die Firebase-Umgebungsvariablen in .env.local (siehe FIREBASE_SETUP.md)');
}

// Exportiere db nur wenn Firebase initialisiert wurde
export { db };

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
