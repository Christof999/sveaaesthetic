import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './firebase';

// Admin-E-Mail-Adressen
// WICHTIG: Ersetze diese mit deinen echten Admin-E-Mail-Adressen!
// Du kannst auch Umgebungsvariablen verwenden: NEXT_PUBLIC_ADMIN_EMAILS=email1@example.com,email2@example.com
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
  'christof.didi@googlemail.com', // Haupt-Admin
  'admin@sveaaesthetic.de', // Fallback
  // Füge weitere Admin-E-Mails hier hinzu
];

export const isAdminEmail = (email: string | null): boolean => {
  if (!email) {
    console.log('isAdminEmail: Keine E-Mail angegeben');
    return false;
  }
  const emailLower = email.toLowerCase();
  const isAdmin = ADMIN_EMAILS.some(adminEmail => emailLower === adminEmail.toLowerCase());
  console.log(`isAdminEmail: Prüfe ${emailLower} gegen ${ADMIN_EMAILS.join(', ')} -> ${isAdmin}`);
  return isAdmin;
};

export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth ist nicht initialisiert');
  }
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Prüfe ob E-Mail eine Admin-E-Mail ist
  if (!isAdminEmail(userCredential.user.email)) {
    await signOut(auth);
    throw new Error('Diese E-Mail-Adresse hat keinen Admin-Zugang');
  }
  
  return userCredential.user;
};

export const loginWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase Auth ist nicht initialisiert');
  }
  
  try {
    const provider = new GoogleAuthProvider();
    // Zusätzliche Scopes anfordern (optional)
    provider.addScope('email');
    provider.addScope('profile');
    
    const userCredential = await signInWithPopup(auth, provider);
    const userEmail = userCredential.user.email;
    
    console.log('Google Login erfolgreich. E-Mail:', userEmail);
    console.log('Admin-E-Mails:', ADMIN_EMAILS);
    
    // Prüfe ob E-Mail eine Admin-E-Mail ist
    if (!isAdminEmail(userEmail)) {
      console.log('E-Mail ist nicht in Admin-Liste:', userEmail);
      await signOut(auth);
      throw new Error(`Diese E-Mail-Adresse (${userEmail}) hat keinen Admin-Zugang. Bitte kontaktiere den Administrator.`);
    }
    
    console.log('Admin-Zugang bestätigt für:', userEmail);
    return userCredential.user;
  } catch (error: any) {
    console.error('Google Login Fehler:', error);
    
    // Spezifische Fehlermeldungen
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Anmeldung wurde abgebrochen. Bitte versuche es erneut.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup wurde blockiert. Bitte erlaube Popups für diese Seite.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Diese Domain ist nicht autorisiert. Bitte kontaktiere den Administrator.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google Sign-In ist nicht aktiviert. Bitte aktiviere es in der Firebase Console.');
    }
    
    // Weiterwerfen des ursprünglichen Fehlers
    throw error;
  }
};

export const logout = async () => {
  if (!auth) {
    throw new Error('Firebase Auth ist nicht initialisiert');
  }
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  if (!auth) {
    throw new Error('Firebase Auth ist nicht initialisiert');
  }
  await sendPasswordResetEmail(auth, email);
};

export const getCurrentUser = (): User | null => {
  if (!auth) return null;
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const createAdminAccount = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth ist nicht initialisiert');
  }
  
  // Prüfe zuerst ob E-Mail eine Admin-E-Mail ist
  if (!isAdminEmail(email)) {
    throw new Error(`Diese E-Mail-Adresse (${email}) hat keine Berechtigung zur Registrierung. Bitte kontaktiere den Administrator.`);
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Optional: E-Mail-Verifizierung senden
  // await sendEmailVerification(userCredential.user);
  
  console.log('Admin-Account erfolgreich erstellt für:', email);
  return userCredential.user;
};

