'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function BookingPage() {
  const params = useParams();
  const customerName = params.name as string;
  const decodedName = decodeURIComponent(customerName);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setSelectedFile(null);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Fehler beim Buchen des Termins: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-light text-gray-700 mb-4">SVEAAESTHETIC</h1>
          <div className="border border-gray-200 p-8">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Termin erfolgreich gebucht!</h2>
            <p className="text-gray-600 mb-6">
              Vielen Dank {decodedName}! Dein Termin wurde erfolgreich gebucht.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                window.location.reload();
              }}
              className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Neuen Termin buchen
            </button>
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
          <h2 className="text-2xl font-light text-gray-700 mb-6">
            Hallo {decodedName},
          </h2>
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

