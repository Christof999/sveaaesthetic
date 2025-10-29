'use client';

import { useEffect, useState } from 'react';
import { Appointment } from '@/types';

export default function CalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const now = new Date();
  // Filtere nur zukünftige Termine
  const futureAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(`${apt.date}T${apt.time}`);
    return appointmentDate >= now;
  });

  const appointmentsByDate = futureAppointments.reduce((acc, apt) => {
    const date = apt.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return <div className="text-gray-500">Lädt...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-light text-gray-700 mb-6">Kalenderansicht</h2>
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="border-l-2 border-gray-300 pl-6 pb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              {new Date(date).toLocaleDateString('de-DE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="space-y-4">
              {appointmentsByDate[date]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{appointment.customerName}</p>
                          <p className="text-sm text-gray-600">{appointment.time} Uhr</p>
                        </div>
                        {appointment.comment && (
                          <p className="text-sm text-gray-500 italic">{appointment.comment}</p>
                        )}
                      </div>
                      {appointment.imageUrl && (
                        <div className="mt-3">
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
        ))}
        {sortedDates.length === 0 && (
          <p className="text-gray-400">Keine Termine vorhanden</p>
        )}
      </div>
    </div>
  );
}
