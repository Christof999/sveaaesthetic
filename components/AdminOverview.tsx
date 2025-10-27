'use client';

import { useEffect, useState } from 'react';
import { Appointment } from '@/types';

export default function AdminOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      const now = new Date();
      return appointmentDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 10);

  if (loading) {
    return <div className="text-gray-500">Lädt...</div>;
  }

  if (upcomingAppointments.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-light text-gray-700 mb-6">Nächste Termine</h2>
        <p className="text-gray-400">Keine anstehenden Termine</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-light text-gray-700 mb-6">Nächste Termine</h2>
      <div className="space-y-4">
        {upcomingAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="border border-gray-200 p-6 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {appointment.customerName}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Datum:</span> {new Date(appointment.date).toLocaleDateString('de-DE')}
                  </p>
                  <p>
                    <span className="font-medium">Uhrzeit:</span> {appointment.time}
                  </p>
                  {appointment.comment && (
                    <p className="mt-3 text-gray-500 italic">
                      {appointment.comment}
                    </p>
                  )}
                </div>
              </div>
              {appointment.imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Inspo Bild:</p>
                  <img 
                    src={appointment.imageUrl} 
                    alt="Inspo" 
                    className="max-w-xs h-auto border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
