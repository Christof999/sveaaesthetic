import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { Customer } from '@/types';
import { StorageService } from '@/lib/storage';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const customerName = searchParams.get('name') || '';

    const customer = await StorageService.getCustomerById(id);
    
    if (!customer) {
      return NextResponse.json({ error: 'Kundin nicht gefunden' }, { status: 404 });
    }

    // URL für die Buchungsseite
    // Build booking URL
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const bookingUrl = `${baseUrl}/book/${encodeURIComponent(customerName)}`;
    
    // QR Code generieren
    const qrCodeDataURL = await QRCode.toDataURL(bookingUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#374151',
        light: '#ffffff'
      }
    });

    // SVG Template mit schönem Design
    const svgContent = `
      <svg width="500" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="600" fill="white"/>
        
        <!-- Header -->
        <text x="250" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#6b7280" text-anchor="middle">
          SVEAAESTHETIC
        </text>
        
        <text x="250" y="75" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
          Nagel Design Studio
        </text>
        
        <!-- Horizontal Line -->
        <line x1="50" y1="100" x2="450" y2="100" stroke="#e5e7eb" stroke-width="2"/>
        
        <!-- QR Code Placeholder -->
        <foreignObject x="50" y="120" width="400" height="400">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <img src="${qrCodeDataURL}" width="400" height="400" alt="QR Code" />
          </div>
        </foreignObject>
        
        <!-- Footer Text -->
        <text x="250" y="540" font-family="Arial, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">
          Scan to book your appointment
        </text>
        
        <text x="250" y="570" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af" text-anchor="middle">
          ${customerName}
        </text>
      </svg>
    `;

    // Konvertiere SVG zu PNG (vereinfacht: wir geben SVG zurück mit data URL embedding)
    // Für echte PNG müssten wir Canvas verwenden
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page {
                size: A4;
                margin: 40mm;
              }
            }
            body { 
              margin: 0; 
              padding: 40px; 
              background: white; 
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container { 
              max-width: 500px; 
              width: 100%;
              text-align: center;
              padding: 40px;
              border: 1px solid #e5e7eb;
            }
            h1 { 
              font-size: 28px; 
              color: #6b7280; 
              margin: 0 0 10px 0; 
              font-weight: bold; 
              letter-spacing: 2px;
            }
            .subtitle { 
              font-size: 14px; 
              color: #9ca3af; 
              margin-bottom: 30px; 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .divider { 
              height: 1px; 
              background: #e5e7eb; 
              margin: 30px 0; 
            }
            .qr-code { 
              margin: 40px auto; 
              padding: 20px;
              background: white;
              display: inline-block;
            }
            .qr-code img {
              display: block;
              width: 400px;
              height: 400px;
            }
            .footer { 
              margin-top: 30px; 
              font-size: 13px; 
              color: #6b7280; 
            }
            .footer p:first-child {
              margin-bottom: 8px;
              font-weight: 500;
            }
            .customer-name { 
              margin-top: 10px; 
              font-size: 11px; 
              color: #9ca3af; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>SVEAAESTHETIC</h1>
            <div class="subtitle">Nagel Design Studio</div>
            <div class="divider"></div>
            <div class="qr-code">
              <img src="${qrCodeDataURL}" alt="QR Code" />
            </div>
            <div class="footer">
              <p>Scan to book your appointment</p>
              <p class="customer-name">${customerName}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Fehler beim Generieren des QR Codes' }, { status: 500 });
  }
}

