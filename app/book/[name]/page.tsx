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

  // Prüfe ob Kundin existiert
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

    console.log('Submit button clicked');
    console.log('Form data:', { selectedDate, selectedTime, comment, selectedFile });

    try {
      let imageUrl = '';

      // Upload image if provided
      if (selectedFile) {
        console.log('Uploading image...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('appointmentId', Date.now().toString());

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        console.log('Upload response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          throw new Error('Fehler beim Hochladen des Bildes');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
        console.log('Image uploaded successfully');
      }

      // Update/Create customer with email if provided
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
          // Note: Falls Customer bereits existiert, muss die API das updaten
          // Für jetzt erstellen wir einfach einen neuen oder überschreiben
        } catch (err) {
          console.warn('Konnte E-Mail nicht speichern:', err);
          // Nicht kritisch - Termin soll trotzdem erstellt werden
        }
      }

      // Prüfe nochmal ob Kundin existiert bevor Termin erstellt wird
      const customerCheckResponse = await fetch('/api/customers');
      const customerCheckData = await customerCheckResponse.json();
      const customer = (customerCheckData.customers || []).find((c: { name: string }) => c.name === decodedName);
      
      if (!customer) {
        throw new Error('Kundin nicht gefunden. Neue Termine können nicht mehr gebucht werden.');
      }

      // Create appointment
      const appointment = {
        customerId: decodedName, // Simplified: using name as ID
        customerName: decodedName,
        date: selectedDate,
        time: selectedTime,
        comment: comment,
        imageUrl: imageUrl
      };

      console.log('Creating appointment:', appointment);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });

      console.log('Appointment API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Fehler beim Buchen des Termins');
      }

      const result = await response.json();
      console.log('Appointment created successfully:', result);

      setSuccess(true);
      setSelectedDate('');
      setSelectedTime('');
      setComment('');
      setEmail('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Fehler beim Buchen des Termins: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  // Zeige Fehlerseite wenn Kundin nicht existiert
  if (customerExists === false) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-light text-gray-600 mb-8">SVEAAESTHETIC</h1>
          <div className="border border-gray-200 p-8">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Zugriff nicht möglich</h2>
            <p className="text-gray-600 mb-4">
              Diese Buchungsseite ist nicht mehr verfügbar.
            </p>
            <p className="text-sm text-gray-500">
              Bitte kontaktiere das Studio für weitere Informationen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Warte auf Prüfung
  if (customerExists === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-light text-gray-700 mb-4">SVEAAESTHETIC</h1>
          <div className="border border-gray-200 p-8">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Termin erfolgreich gebucht!</h2>
            <p className="text-gray-600 mb-4">
              Vielen Dank {decodedName}! Dein Termin wurde erfolgreich gebucht.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Bitte bestätige deinen Termin auf deiner Übersichtsseite.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href={`/customer/${encodeURIComponent(decodedName)}`}
                className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
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
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
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
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-light text-gray-600 mb-8 text-center">
          SVEAAESTHETIC
        </h1>
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-gray-700">
              Hallo {decodedName},
            </h2>
            <a
              href={`/customer/${encodeURIComponent(decodedName)}`}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Meine Termine
            </a>
          </div>
          <p className="text-gray-600 mb-8">
            Hier hast du die Möglichkeit einen Termin bei mir zu buchen.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum auswählen
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uhrzeit auswählen
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail <span className="text-gray-400 text-xs font-normal">(optional - für Benachrichtigungen)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                placeholder="deine@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wir benachrichtigen dich per E-Mail, sobald dein Termin bestätigt oder abgelehnt wurde.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung / Notizen
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                placeholder="Beschreibe hier, was du möchtest..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspo Bild hochladen (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Ausgewählt: {selectedFile.name}
                </p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="w-full py-3 bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird gebucht...' : 'Termin buchen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

