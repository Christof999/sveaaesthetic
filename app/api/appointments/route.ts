import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { Appointment } from '@/types';

export async function GET() {
  try {
    console.log('API: Fetching appointments...');
    const appointments = await StorageService.getAppointments();
    console.log(`API: Found ${appointments.length} appointments`);
    // Migriere alte Termine: Wenn kein Status vorhanden, setze auf 'confirmed'
    const migratedAppointments = appointments.map(apt => ({
      ...apt,
      status: apt.status || 'confirmed',
      createdAt: apt.createdAt || new Date(0).toISOString(), // Fallback für alte Termine
      seenByAdmin: apt.seenByAdmin ?? false,
      confirmedByCustomer: apt.confirmedByCustomer ?? (apt.status === 'confirmed' ? true : false),
    }));
    return NextResponse.json({ appointments: migratedAppointments });
  } catch (error) {
    console.error('API: Error fetching appointments:', error);
    return NextResponse.json({ 
      error: 'Fehler beim Laden der Termine',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Setze Status auf pending und füge Timestamp hinzu
    const appointment: Appointment = {
      ...body,
      status: body.status || 'pending',
      createdAt: body.createdAt || new Date().toISOString(),
      seenByAdmin: false,
      confirmedByCustomer: false
    };
    
    await StorageService.addAppointment(appointment);
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ 
      error: 'Fehler beim Erstellen des Termins',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
