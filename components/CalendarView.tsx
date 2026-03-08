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
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--muted)] text-sm">Lädt...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header mit Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-medium text-[var(--foreground)]">
          {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-[var(--foreground)] hover:bg-[var(--card-border)]/50 rounded-xl transition-colors"
            aria-label="Vorheriger Monat"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-border)]/50 rounded-xl transition-colors"
          >
            Heute
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-[var(--foreground)] hover:bg-[var(--card-border)]/50 rounded-xl transition-colors"
            aria-label="Nächster Monat"
          >
            →
          </button>
        </div>
      </div>

      {/* Kalender Grid */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-sm">
        {/* Wochentags-Header */}
        <div className="grid grid-cols-7 border-b border-[var(--card-border)]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-[var(--muted)] bg-[var(--background)]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Kalender-Tage */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square border-r border-b border-[var(--card-border)]/50" />;
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
                  aspect-square border-r border-b border-[var(--card-border)]/50 p-2 cursor-pointer
                  transition-colors hover:bg-[var(--background)]
                  ${isSelected ? 'bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/30' : ''}
                  ${isTodayDate && !isSelected ? 'bg-[var(--accent)]/5' : ''}
                  ${isPastDate ? 'opacity-50' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`
                      text-sm font-medium mb-1
                      ${isTodayDate ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}
                      ${isSelected ? 'text-[var(--accent)] font-semibold' : ''}
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
        <div className="mt-6 border border-[var(--card-border)] rounded-2xl p-6 bg-[var(--card-bg)] shadow-sm">
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">
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
                  className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-[var(--foreground)]">{appointment.customerName}</p>
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
                      <p className="text-sm text-[var(--muted)] mb-2">{appointment.time} Uhr</p>
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
        <div className="mt-6 border border-[var(--card-border)] rounded-2xl p-6 bg-[var(--card-bg)] text-center text-[var(--muted)] shadow-sm">
          Keine Termine an diesem Tag
        </div>
      )}

      {/* Modal für Termin-Details */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-[var(--card-bg)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-medium text-[var(--foreground)]">Termin-Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/50 rounded-xl transition-colors"
                aria-label="Schließen"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Kundin */}
              <div>
                <label className="text-sm font-medium text-[var(--muted)] block mb-1">Kundin</label>
                <p className="text-lg text-[var(--foreground)]">{selectedAppointment.customerName}</p>
              </div>

              {/* Datum und Uhrzeit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted)] block mb-1">Datum</label>
                  <p className="text-[var(--foreground)]">
                    {new Date(selectedAppointment.date).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted)] block mb-1">Uhrzeit</label>
                  <p className="text-[var(--foreground)]">{selectedAppointment.time} Uhr</p>
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
                  <label className="text-sm font-medium text-[var(--muted)] block mb-1">Kommentar / Notizen</label>
                  <p className="text-[var(--foreground)] whitespace-pre-wrap bg-[var(--background)] p-3 rounded-xl border border-[var(--card-border)]">
                    {selectedAppointment.comment}
                  </p>
                </div>
              )}

              {/* Bild */}
              {selectedAppointment.imageUrl && (
                <div>
                  <label className="text-sm font-medium text-[var(--muted)] block mb-2">Inspirationsbild</label>
                  <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--card-border)]">
                    <img
                      src={selectedAppointment.imageUrl}
                      alt="Inspirationsbild"
                      className="max-w-full h-auto rounded-xl border border-[var(--card-border)]"
                    />
                  </div>
                </div>
              )}

              {/* Zusätzliche Informationen */}
              <div className="pt-4 border-t border-[var(--card-border)]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-[var(--muted)] block mb-1">Erstellt am</label>
                    <p className="text-[var(--foreground)]">
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
                      <label className="text-[var(--muted)] block mb-1">Von Kundin bestätigt</label>
                      <p className="text-[var(--foreground)]">
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
