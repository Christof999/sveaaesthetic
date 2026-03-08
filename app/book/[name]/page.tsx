'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BookingPage() {
  const params = useParams();
  const customerName = params.name as string;
  const decodedName = decodeURIComponent(customerName);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        const customer = (data.customers || []).find((c: { name: string }) => c.name === decodedName);
        setCustomerExists(customer !== undefined);
      } catch (err) {
        console.error('Error checking customer:', err);
        setCustomerExists(false);
      }
    };
    checkCustomer();
  }, [decodedName]);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('appointmentId', Date.now().toString());

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Fehler beim Hochladen des Bildes');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      if (email.trim()) {
        try {
          await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: decodedName,
              email: email.trim(),
            }),
          });
        } catch (err) {
          console.warn('Konnte E-Mail nicht speichern:', err);
        }
      }

      const customerCheckResponse = await fetch('/api/customers');
      const customerCheckData = await customerCheckResponse.json();
      const customer = (customerCheckData.customers || []).find((c: { name: string }) => c.name === decodedName);
      
      if (!customer) {
        throw new Error('Kundin nicht gefunden. Neue Termine können nicht mehr gebucht werden.');
      }

      const appointment = {
        customerId: decodedName,
        customerName: decodedName,
        date: selectedDate,
        time: selectedTime,
        comment: comment,
        imageUrl: imageUrl
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Buchen des Termins');
      }

      setSuccess(true);
      setSelectedDate('');
      setSelectedTime('');
      setComment('');
      setEmail('');
      setSelectedFile(null);
    } catch (err) {
      setError('Fehler beim Buchen des Termins: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const inputClass =
    'w-full px-4 py-3 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-colors';

  if (customerExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-light tracking-tight text-[var(--foreground)] mb-2">SVEAAESTHETIC</h1>
          <p className="text-sm text-[var(--muted)] mb-8">Nagel Design Studio</p>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-4">Zugriff nicht möglich</h2>
            <p className="text-[var(--muted)] mb-4">
              Diese Buchungsseite ist nicht mehr verfügbar.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Bitte kontaktiere das Studio für weitere Informationen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (customerExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--muted)] text-sm">Lädt...</span>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-light tracking-tight text-[var(--foreground)] mb-2">SVEAAESTHETIC</h1>
          <p className="text-sm text-[var(--muted)] mb-8">Nagel Design Studio</p>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-4">Termin erfolgreich gebucht!</h2>
            <p className="text-[var(--muted)] mb-4">
              Vielen Dank {decodedName}! Dein Termin wurde erfolgreich gebucht.
            </p>
            <p className="text-sm text-[var(--muted)] mb-6">
              Bitte bestätige deinen Termin auf deiner Übersichtsseite.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`/customer/${encodeURIComponent(decodedName)}`}
                className="px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
              >
                Zur Übersicht
              </a>
              <button
                onClick={() => {
                  setSuccess(false);
                  setSelectedDate('');
                  setSelectedTime('');
                  setComment('');
                  setEmail('');
                  setSelectedFile(null);
                }}
                className="px-6 py-3 border border-[var(--card-border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-[var(--card-border)]/50 transition-colors"
              >
                Neuen Termin buchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-light tracking-tight text-[var(--foreground)] mb-2 text-center">
          SVEAAESTHETIC
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8 text-center">Nagel Design Studio</p>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-medium text-[var(--foreground)]">
              Hallo {decodedName},
            </h2>
            <a
              href={`/customer/${encodeURIComponent(decodedName)}`}
              className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
            >
              Meine Termine
            </a>
          </div>
          <p className="text-[var(--muted)] mb-8">
            Hier hast du die Möglichkeit einen Termin bei mir zu buchen.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Datum auswählen
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Uhrzeit auswählen
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Uhrzeit wählen</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time} Uhr
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                E-Mail <span className="text-[var(--muted)] text-xs font-normal">(optional - für Benachrichtigungen)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="deine@email.de"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                Wir benachrichtigen dich per E-Mail, sobald dein Termin bestätigt oder abgelehnt wurde.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Beschreibung / Notizen
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="Beschreibe hier, was du möchtest..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Inspo Bild hochladen (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:text-white file:font-medium file:cursor-pointer hover:file:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
              {selectedFile && (
                <p className="text-sm text-[var(--muted)] mt-2">
                  Ausgewählt: {selectedFile.name}
                </p>
              )}
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="w-full py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Wird gebucht...' : 'Termin buchen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
