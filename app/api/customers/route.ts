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
    const customer: Customer = body;
    
    await StorageService.addCustomer(customer);
    console.log('API: Customer added successfully');
    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('API: Error adding customer:', error);
    return NextResponse.json({ 
      error: 'Fehler beim Erstellen des Kunden',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
