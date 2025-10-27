import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { Appointment } from '@/types';

export async function GET() {
  try {
    const appointments = await StorageService.getAppointments();
    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Termine' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const appointment: Appointment = body;
    
    await StorageService.addAppointment(appointment);
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Erstellen des Termins' }, { status: 500 });
  }
}
