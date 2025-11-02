import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { sendAppointmentNotification } from '@/lib/email';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Hole den aktuellen Termin, um den alten Status zu vergleichen
    const appointments = await StorageService.getAppointments();
    const appointment = appointments.find(apt => apt.id === id);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Termin nicht gefunden' }, { status: 404 });
    }

    // Update appointment
    await StorageService.updateAppointment(id, body);

    // Sende E-Mail-Benachrichtigung wenn Status geändert wurde zu 'confirmed', 'rejected' oder 'cancelled'
    if (body.status && body.status !== appointment.status && 
        (body.status === 'confirmed' || body.status === 'rejected' || body.status === 'cancelled')) {
      
      // Hole Kundin-Daten für E-Mail-Adresse
      const customers = await StorageService.getCustomers();
      const customer = customers.find(c => 
        c.id === appointment.customerId || 
        c.name === appointment.customerName
      );

      // Sende E-Mail, wenn E-Mail-Adresse vorhanden
      if (customer?.email) {
        try {
          await sendAppointmentNotification({
            to: customer.email,
            customerName: appointment.customerName,
            date: appointment.date,
            time: appointment.time,
            status: body.status as 'confirmed' | 'rejected' | 'cancelled',
            comment: appointment.comment,
          });
        } catch (emailError) {
          // E-Mail-Fehler soll den Update nicht blockieren
          console.error('Fehler beim Senden der E-Mail-Benachrichtigung:', emailError);
        }
      } else {
        console.log(`Keine E-Mail-Adresse für Kundin ${appointment.customerName} hinterlegt`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Termins' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await StorageService.deleteAppointment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen des Termins' }, { status: 500 });
  }
}
