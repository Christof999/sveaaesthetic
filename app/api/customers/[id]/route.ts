import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Prüfe ob Kundin existiert
    const customer = await StorageService.getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: 'Kundin nicht gefunden' }, { status: 404 });
    }

    // Lösche Kundin
    await StorageService.deleteCustomer(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ 
      error: 'Fehler beim Löschen der Kundin',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


