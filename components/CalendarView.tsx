'use client';

import { useEffect, useState } from 'react';
import { Appointment } from '@/types';

export default function CalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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

  // Filtere nur stornierte/abgesagte Termine heraus (zeige alle anderen, auch vergangene)
  const activeAppointments = appointments.filter(
    apt => apt.status !== 'cancelled' && apt.status !== 'rejected'
  );

  // Gruppiere Termine nach Datum
  const appointmentsByDate = activeAppointments.reduce((acc, apt) => {
    const date = apt.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Kalender-Funktionen
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Deutsche Wochentage
  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  // Erstelle Array mit allen Tagen des Monats (inkl. leere Zellen für Anfang)
  const calendarDays: (number | null)[] = [];
  
  // Leere Zellen für Tage vor dem ersten Tag des Monats
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Tage des Monats
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDateKey = (day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const today = new Date();
    const date = new Date(year, month, day);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const getAppointmentsForDay = (day: number): Appointment[] => {
    const dateKey = formatDateKey(day);
    return appointmentsByDate[dateKey] || [];
  };

  const selectedAppointments = selectedDate ? appointmentsByDate[selectedDate] || [] : [];

  if (loading) {
    return <div className="text-gray-500">Lädt...</div>;
  }

  return (
    <div>
      {/* Header mit Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-light text-gray-700">
          {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Heute
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Kalender Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Wochentags-Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Kalender-Tage */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square border-r border-b border-gray-100" />;
            }

            const dayAppointments = getAppointmentsForDay(day);
            const dateKey = formatDateKey(day);
            const isSelected = selectedDate === dateKey;
            const isTodayDate = isToday(day);
            const isPastDate = isPast(day);

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  aspect-square border-r border-b border-gray-100 p-2 cursor-pointer
                  transition-colors hover:bg-gray-50
                  ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                  ${isTodayDate ? 'bg-blue-100/30' : ''}
                  ${isPastDate ? 'opacity-50' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`
                      text-sm font-medium mb-1
                      ${isTodayDate ? 'text-blue-600' : 'text-gray-700'}
                      ${isSelected ? 'text-blue-700' : ''}
                    `}
                  >
                    {day}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {dayAppointments.length > 0 && (
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                            }}
                            className={`
                              text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity
                              ${apt.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : apt.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-700'
                              }
                            `}
                            title={`${apt.time} Uhr - ${apt.customerName} (Klicken für Details)`}
                          >
                            {apt.time} {apt.customerName}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayAppointments.length - 2} weitere
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detaillierte Ansicht für ausgewählten Tag */}
      {selectedDate && selectedAppointments.length > 0 && (
        <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {new Date(selectedDate).toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <div className="space-y-4">
            {selectedAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => setSelectedAppointment(appointment)}
                  className="bg-white border border-gray-200 p-4 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-800">{appointment.customerName}</p>
                        <span
                          className={`
                            text-xs px-2 py-1 rounded
                            ${appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-700'
                            }
                          `}
                        >
                          {appointment.status === 'confirmed' ? 'Bestätigt' :
                           appointment.status === 'pending' ? 'Ausstehend' :
                           appointment.status === 'completed' ? 'Abgeschlossen' : appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{appointment.time} Uhr</p>
                      {appointment.comment && (
                        <p className="text-sm text-gray-500 italic mb-2 line-clamp-2">{appointment.comment}</p>
                      )}
                      {appointment.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={appointment.imageUrl}
                            alt="Inspo"
                            className="max-w-xs h-auto border border-gray-200 rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedDate && selectedAppointments.length === 0 && (
        <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-gray-50 text-center text-gray-500">
          Keine Termine an diesem Tag
        </div>
      )}

      {/* Modal für Termin-Details */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-800">Termin-Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Kundin */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Kundin</label>
                <p className="text-lg text-gray-800">{selectedAppointment.customerName}</p>
              </div>

              {/* Datum und Uhrzeit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Datum</label>
                  <p className="text-gray-800">
                    {new Date(selectedAppointment.date).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Uhrzeit</label>
                  <p className="text-gray-800">{selectedAppointment.time} Uhr</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Status</label>
                <span
                  className={`
                    inline-block px-3 py-1 rounded text-sm font-medium
                    ${selectedAppointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : selectedAppointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedAppointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {selectedAppointment.status === 'confirmed' ? 'Bestätigt' :
                   selectedAppointment.status === 'pending' ? 'Ausstehend' :
                   selectedAppointment.status === 'completed' ? 'Abgeschlossen' : selectedAppointment.status}
                </span>
              </div>

              {/* Kommentar */}
              {selectedAppointment.comment && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Kommentar / Notizen</label>
                  <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                    {selectedAppointment.comment}
                  </p>
                </div>
              )}

              {/* Bild */}
              {selectedAppointment.imageUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Inspirationsbild</label>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <img
                      src={selectedAppointment.imageUrl}
                      alt="Inspirationsbild"
                      className="max-w-full h-auto rounded border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Zusätzliche Informationen */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500 block mb-1">Erstellt am</label>
                    <p className="text-gray-800">
                      {selectedAppointment.createdAt
                        ? new Date(selectedAppointment.createdAt).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Nicht verfügbar'}
                    </p>
                  </div>
                  {selectedAppointment.confirmedByCustomer !== undefined && (
                    <div>
                      <label className="text-gray-500 block mb-1">Von Kundin bestätigt</label>
                      <p className="text-gray-800">
                        {selectedAppointment.confirmedByCustomer ? 'Ja' : 'Nein'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
