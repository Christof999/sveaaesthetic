'use client';

import { useEffect, useState } from 'react';
import { Appointment } from '@/types';

export default function AdminOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    // Lade letzten Login-Zeitpunkt
    if (typeof window !== 'undefined') {
      setLastLogin(localStorage.getItem('lastAdminLogin'));
    }
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

  const markAsSeen = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seenByAdmin: true }),
      });
      fetchAppointments(); // Refresh
    } catch (error) {
      console.error('Fehler beim Markieren:', error);
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchAppointments(); // Refresh
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  const now = new Date();
  const lastLoginDate = lastLogin ? new Date(lastLogin) : null;

  // Neue Termine: Erstellt nach letztem Login und nicht als gesehen markiert
  const newAppointments = appointments.filter(apt => {
    if (!lastLoginDate) return false;
    const createdDate = new Date(apt.createdAt);
    return createdDate > lastLoginDate && !apt.seenByAdmin;
  });

  // Unbestätigte Termine (pending)
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  // Bestätigte, zukünftige Termine
  const confirmedUpcoming = appointments
    .filter(apt => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      return apt.status === 'confirmed' && appointmentDate >= now;
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

  return (
    <div className="space-y-8">
      {/* Neue Termine */}
      {newAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Neue Termine ({newAppointments.length})
          </h2>
          <div className="space-y-4">
            {newAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onMarkSeen={() => markAsSeen(appointment.id)}
                onStatusChange={(status) => updateStatus(appointment.id, status)}
                isNew
              />
            ))}
          </div>
        </div>
      )}

      {/* Unbestätigte Termine */}
      {pendingAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-gray-700 mb-4">
            Unbestätigte Termine ({pendingAppointments.length})
          </h2>
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onMarkSeen={() => markAsSeen(appointment.id)}
                onStatusChange={(status) => updateStatus(appointment.id, status)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bestätigte, zukünftige Termine */}
      <div>
        <h2 className="text-xl font-light text-gray-700 mb-6">Nächste Termine</h2>
        {confirmedUpcoming.length === 0 ? (
          <p className="text-gray-400">Keine anstehenden Termine</p>
        ) : (
          <div className="space-y-4">
            {confirmedUpcoming.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onMarkSeen={() => markAsSeen(appointment.id)}
                onStatusChange={(status) => updateStatus(appointment.id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onMarkSeen,
  onStatusChange,
  isNew = false,
}: {
  appointment: Appointment;
  onMarkSeen: () => void;
  onStatusChange: (status: Appointment['status']) => void;
  isNew?: boolean;
}) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      className={`border p-6 hover:border-gray-300 transition-colors ${
        isNew ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-gray-800">
              {appointment.customerName}
            </h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusColors[appointment.status]}`}
            >
              {appointment.status === 'pending' && 'Ausstehend'}
              {appointment.status === 'confirmed' && 'Bestätigt'}
              {appointment.status === 'rejected' && 'Abgelehnt'}
              {appointment.status === 'completed' && 'Abgeschlossen'}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Datum:</span>{' '}
              {new Date(appointment.date).toLocaleDateString('de-DE')}
            </p>
            <p>
              <span className="font-medium">Uhrzeit:</span> {appointment.time}
            </p>
            {appointment.comment && (
              <p className="mt-3 text-gray-500 italic">{appointment.comment}</p>
            )}
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
        <div className="ml-4 flex flex-col gap-2">
          {isNew && !appointment.seenByAdmin && (
            <button
              onClick={onMarkSeen}
              className="px-3 py-1 text-xs bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Als gesehen markieren
            </button>
          )}
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange('confirmed')}
                className="px-3 py-1 text-xs bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Bestätigen
              </button>
              <button
                onClick={() => onStatusChange('rejected')}
                className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Ablehnen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
