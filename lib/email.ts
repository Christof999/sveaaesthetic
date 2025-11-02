import { Resend } from 'resend';

// Resend API Key (optional - wenn nicht gesetzt, werden keine E-Mails gesendet)
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || 'noreply@sveaaesthetic.com';

let resend: Resend | null = null;
if (resendApiKey && resendApiKey !== 'demo') {
  resend = new Resend(resendApiKey);
}

interface NotificationEmailProps {
  to: string;
  customerName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'rejected' | 'cancelled';
  comment?: string;
}

export async function sendAppointmentNotification({
  to,
  customerName,
  date,
  time,
  status,
  comment,
}: NotificationEmailProps): Promise<{ success: boolean; error?: string }> {
  // Wenn kein Resend konfiguriert ist, einfach success zurückgeben (Silent Fail)
  if (!resend) {
    console.log('E-Mail-Service nicht konfiguriert - Benachrichtigung übersprungen');
    return { success: true };
  }

  try {
    const isConfirmed = status === 'confirmed';
    const isCancelled = status === 'cancelled';
    const isRejected = status === 'rejected';
    
    let subject: string;
    if (isConfirmed) {
      subject = `✅ Termin bestätigt - ${date} um ${time} Uhr`;
    } else if (isCancelled) {
      subject = `🚫 Termin storniert - ${date} um ${time} Uhr`;
    } else {
      subject = `❌ Termin leider nicht möglich`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            .header h1 {
              font-size: 24px;
              font-weight: 300;
              color: #6b7280;
              letter-spacing: 2px;
              margin: 0;
            }
            .content {
              margin: 30px 0;
            }
            .appointment-details {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 20px;
              margin: 20px 0;
            }
            .appointment-details p {
              margin: 8px 0;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              margin: 10px 0;
            }
            .status-confirmed {
              background: #d1fae5;
              color: #065f46;
            }
            .status-rejected {
              background: #fee2e2;
              color: #991b1b;
            }
            .status-cancelled {
              background: #fef3c7;
              color: #92400e;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SVEAAESTHETIC</h1>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 5px;">Nagel Design Studio</p>
          </div>
          
          <div class="content">
            <p>Hallo ${customerName},</p>
            
            ${isConfirmed 
              ? `<p>dein Termin wurde <strong>bestätigt</strong>! 🎉</p>
                 <p>Wir freuen uns, dich zu sehen.</p>`
              : isCancelled
              ? `<p>dein Termin wurde <strong>storniert</strong>.</p>
                 <p>Falls du einen neuen Termin wünschst, kannst du jederzeit über deine persönliche Buchungsseite einen neuen Termin buchen.</p>`
              : `<p>leider können wir deinen Termin an diesem Tag nicht wahrnehmen.</p>
                 <p>Bitte buche einen anderen Termin über deine persönliche Buchungsseite.</p>`
            }
            
            <div class="appointment-details">
              <span class="status-badge status-${status}">
                ${isConfirmed ? '✅ Bestätigt' : isCancelled ? '🚫 Storniert' : '❌ Nicht möglich'}
              </span>
              <p><strong>Datum:</strong> ${new Date(date).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
              <p><strong>Uhrzeit:</strong> ${time} Uhr</p>
              ${comment ? `<p><strong>Notiz:</strong> ${comment}</p>` : ''}
            </div>
            
            ${isConfirmed 
              ? '<p>Bitte sei pünktlich. Wir freuen uns auf dich!</p>'
              : isCancelled
              ? '<p>Du kannst jederzeit einen neuen Termin über deine Buchungsseite vereinbaren.</p>'
              : '<p>Du kannst jederzeit einen neuen Termin über deine Buchungsseite vereinbaren.</p>'
            }
          </div>
          
          <div class="footer">
            <p>SVEAAESTHETIC<br>Nagel Design Studio</p>
            <p style="margin-top: 10px;">Diese E-Mail wurde automatisch gesendet.</p>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    if (result.error) {
      console.error('E-Mail-Fehler:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('E-Mail erfolgreich gesendet:', result.data);
    return { success: true };
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}

