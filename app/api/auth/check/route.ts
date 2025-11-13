import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Firebase Admin SDK für Server-seitige Token-Verifizierung
let adminApp: any = null;

if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && auth) {
  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      adminApp = getApps()[0];
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!adminApp) {
      // Fallback: Wenn Admin SDK nicht verfügbar, prüfe nur ob Token existiert
      // In Produktion sollte Admin SDK konfiguriert sein
      return NextResponse.json({ authenticated: !!token }, { status: 200 });
    }

    try {
      const adminAuth = getAuth(adminApp);
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Prüfe ob E-Mail eine Admin-E-Mail ist
      const adminEmails = [
        'admin@sveaaesthetic.de', // Ersetze mit deiner Admin-E-Mail
      ];
      
      const isAdmin = adminEmails.some(
        email => email.toLowerCase() === decodedToken.email?.toLowerCase()
      );

      return NextResponse.json({ 
        authenticated: true,
        isAdmin,
        email: decodedToken.email 
      });
    } catch (error) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

