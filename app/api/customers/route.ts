import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { Customer } from '@/types';

export async function GET() {
  try {
    const customers = await StorageService.getCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Kunden' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API: Received customer data:', body);
    
    // Prüfe, ob Customer mit diesem Namen bereits existiert
    const existingCustomer = await StorageService.getCustomerByName(body.name);
    
    if (existingCustomer) {
      // Update bestehenden Customer (z.B. mit E-Mail)
      // Entferne undefined Felder und id (wird nicht aktualisiert)
      const updateData: Partial<Customer> = {
        name: body.name,
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
      };
      await StorageService.updateCustomer(existingCustomer.id, updateData);
      console.log('API: Customer updated successfully');
      return NextResponse.json({ 
        success: true, 
        customer: { ...existingCustomer, ...updateData },
        action: 'updated' 
      });
    } else {
      // Erstelle neuen Customer
      // ID wird von Firestore automatisch generiert
      // Entferne undefined Felder (Firebase akzeptiert keine undefined Werte)
      const newCustomer: Customer = {
        id: '', // Wird von Firestore überschrieben
        name: body.name,
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
      };
      await StorageService.addCustomer(newCustomer);
      console.log('API: Customer added successfully');
      return NextResponse.json({ 
        success: true, 
        customer: newCustomer,
        action: 'created' 
      });
    }
  } catch (error) {
    console.error('API: Error adding/updating customer:', error);
    return NextResponse.json({ 
      error: 'Fehler beim Erstellen/Aktualisieren des Kunden',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
