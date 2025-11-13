import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

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
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
      console.log('Project ID:', firebaseConfig.projectId);
    } else {
      app = getApps()[0];
      console.log('Firebase app already initialized');
    }
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firestore database connected');
    console.log('Firebase Auth initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('Firebase nicht konfiguriert - verwende Fallback-Modus');
  }
} else {
  console.log('Firebase nicht konfiguriert - verwende Fallback-Modus');
  console.log('API Key vorhanden:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log('Project ID vorhanden:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Bitte setze die Firebase-Umgebungsvariablen in .env.local (siehe FIREBASE_SETUP.md)');
}

// Exportiere db und auth nur wenn Firebase initialisiert wurde
export { db, auth };

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
