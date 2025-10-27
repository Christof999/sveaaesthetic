import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const appointmentId = formData.get('appointmentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Ungültiger Dateityp' }, { status: 400 });
    }

    // Validate file size (max 2MB before compression)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Datei zu groß (max 2MB)' }, { status: 400 });
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(600, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 60 })
      .toBuffer();

    // Convert to base64
    const base64 = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    return NextResponse.json({ success: true, imageUrl: base64 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Fehler beim Hochladen des Bildes',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
