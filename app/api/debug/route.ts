import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { StorageService } from '@/lib/storage';

export async function GET() {
  const firebaseConfigured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo" &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo"
  );

  const firebaseConnected = db !== null;

  let customersCount = 0;
  let appointmentsCount = 0;
  let error = null;

  try {
    const customers = await StorageService.getCustomers();
    customersCount = customers.length;
    const appointments = await StorageService.getAppointments();
    appointmentsCount = appointments.length;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    firebase: {
      configured: firebaseConfigured,
      connected: firebaseConnected,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
      apiKeySet: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo"),
    },
    data: {
      customers: customersCount,
      appointments: appointmentsCount,
    },
    error: error,
  });
}

