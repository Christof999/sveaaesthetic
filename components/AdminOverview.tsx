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
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // Ende der Woche (Sonntag)

  const lastLoginDate = lastLogin ? new Date(lastLogin) : null;

  // Neue Termine: Erstellt nach letztem Login und nicht als gesehen markiert
  const newAppointments = appointments.filter(apt => {
    if (!lastLoginDate) return false;
    const createdDate = new Date(apt.createdAt);
    return createdDate > lastLoginDate && !apt.seenByAdmin;
  });

  // Unbestätigte Termine (pending)
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  // Termine heute
  const todayAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      const aptDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
      return apt.status === 'confirmed' && aptDay.getTime() === today.getTime();
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  // Termine diese Woche
  const thisWeekAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      return apt.status === 'confirmed' && appointmentDate >= today && appointmentDate <= endOfWeek;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

  // Bestätigte, zukünftige Termine (alle)
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

  // Statistiken
  const stats = {
    today: todayAppointments.length,
    thisWeek: thisWeekAppointments.length,
    pending: pendingAppointments.length,
    new: newAppointments.length,
  };

  if (loading) {
    return <div className="text-gray-500">Lädt...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Statistiken Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Heute"
          value={stats.today}
          color="bg-blue-50 border-blue-200 text-blue-700"
        />
        <StatCard
          label="Diese Woche"
          value={stats.thisWeek}
          color="bg-purple-50 border-purple-200 text-purple-700"
        />
        <StatCard
          label="Ausstehend"
          value={stats.pending}
          color="bg-yellow-50 border-yellow-200 text-yellow-700"
        />
        <StatCard
          label="Neu"
          value={stats.new}
          color="bg-red-50 border-red-200 text-red-700"
          pulse={stats.new > 0}
        />
      </div>

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

      {/* Termine heute */}
      {todayAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-gray-700 mb-4">
            📅 Heute ({todayAppointments.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {todayAppointments.map((appointment) => (
              <CompactAppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={(status) => updateStatus(appointment.id, status)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Diese Woche */}
      {thisWeekAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-gray-700 mb-4">
            📆 Diese Woche ({thisWeekAppointments.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thisWeekAppointments.map((appointment) => (
              <CompactAppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={(status) => updateStatus(appointment.id, status)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unbestätigte Termine */}
      {pendingAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-gray-700 mb-4">
            ⏳ Unbestätigte Termine ({pendingAppointments.length})
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

      {/* Alle nächsten Termine */}
      {confirmedUpcoming.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-gray-700 mb-6">Alle nächsten Termine</h2>
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
        </div>
      )}

      {newAppointments.length === 0 && 
       pendingAppointments.length === 0 && 
       confirmedUpcoming.length === 0 && 
       todayAppointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Keine Termine vorhanden</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  pulse = false,
}: {
  label: string;
  value: number;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-4 ${color} ${pulse ? 'animate-pulse' : ''}`}>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-light">{value}</p>
    </div>
  );
}

function CompactAppointmentCard({
  appointment,
  onStatusChange,
}: {
  appointment: Appointment;
  onStatusChange: (status: Appointment['status']) => void;
}) {
  const isToday = () => {
    const today = new Date();
    const aptDate = new Date(appointment.date);
    return today.toDateString() === aptDate.toDateString();
  };

  return (
    <div
      className={`border p-4 rounded hover:border-gray-300 transition-colors ${
        isToday() ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 mb-1">{appointment.customerName}</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              {new Date(appointment.date).toLocaleDateString('de-DE', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </p>
            <p className="font-medium">{appointment.time} Uhr</p>
          </div>
          {appointment.comment && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{appointment.comment}</p>
          )}
        </div>
        {appointment.imageUrl && (
          <img
            src={appointment.imageUrl}
            alt="Inspo"
            className="w-16 h-16 object-cover rounded border border-gray-200 ml-2"
          />
        )}
      </div>
      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm(`Möchtest du den Termin für ${appointment.customerName} wirklich stornieren?`)) {
                onStatusChange('cancelled');
              }
            }}
            className="px-2 py-1 text-xs bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            Stornieren
          </button>
        </div>
      )}
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
    cancelled: 'bg-orange-100 text-orange-800',
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
              {appointment.status === 'cancelled' && 'Storniert'}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Datum:</span>{' '}
              {new Date(appointment.date).toLocaleDateString('de-DE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p>
              <span className="font-medium">Uhrzeit:</span> {appointment.time} Uhr
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
                className="max-w-xs h-auto border border-gray-200 rounded"
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
          {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
            <button
              onClick={() => {
                if (confirm(`Möchtest du den Termin für ${appointment.customerName} wirklich stornieren?`)) {
                  onStatusChange('cancelled');
                }
              }}
              className="px-3 py-1 text-xs bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              Stornieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
