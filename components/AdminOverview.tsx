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
  endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // Sonntag
  endOfWeek.setHours(23, 59, 59, 999); // Ganzes Wochenende inkl. Sonntag-Termine

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
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--muted)] text-sm">Lädt...</span>
      </div>
    );
  }

  const sectionTitle = 'text-lg font-medium text-[var(--foreground)] mb-4';

  return (
    <div className="space-y-8">
      {/* Statistiken Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Heute"
          value={stats.today}
          color="bg-blue-50/80 border-blue-200/60 text-blue-800"
        />
        <StatCard
          label="Diese Woche"
          value={stats.thisWeek}
          color="bg-violet-50/80 border-violet-200/60 text-violet-800"
        />
        <StatCard
          label="Ausstehend"
          value={stats.pending}
          color="bg-amber-50/80 border-amber-200/60 text-amber-800"
        />
        <StatCard
          label="Neu"
          value={stats.new}
          color="bg-rose-50/80 border-rose-200/60 text-rose-800"
          pulse={stats.new > 0}
        />
      </div>

      {/* Neue Termine */}
      {newAppointments.length > 0 && (
        <div>
          <h2 className={`${sectionTitle} flex items-center gap-2`}>
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" aria-hidden />
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
          <h2 className={sectionTitle}>
            Heute ({todayAppointments.length})
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
          <h2 className={sectionTitle}>
            Diese Woche ({thisWeekAppointments.length})
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
          <h2 className={sectionTitle}>
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

      {/* Alle nächsten Termine */}
      {confirmedUpcoming.length > 0 && (
        <div>
          <h2 className={`${sectionTitle} mb-6`}>Alle nächsten Termine</h2>
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
        <div className="text-center py-16 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
          <p className="text-[var(--muted)] text-lg">Keine Termine vorhanden</p>
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
    <div className={`border rounded-xl p-5 shadow-sm transition-shadow hover:shadow ${color} relative overflow-hidden`}>
      {pulse && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden />
      )}
      <p className="text-sm font-medium mb-1 opacity-90">{label}</p>
      <p className="text-3xl font-light tracking-tight">{value}</p>
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
      className={`border p-4 rounded-xl transition-all ${
        isToday()
          ? 'border-blue-300 bg-blue-50/50 shadow-sm'
          : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--foreground)] mb-1 truncate">{appointment.customerName}</h3>
          <div className="space-y-0.5 text-xs text-[var(--muted)]">
            <p>
              {new Date(appointment.date).toLocaleDateString('de-DE', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </p>
            <p className="font-medium text-[var(--foreground)]">{appointment.time} Uhr</p>
          </div>
          {appointment.comment && (
            <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2">{appointment.comment}</p>
          )}
        </div>
        {appointment.imageUrl && (
          <img
            src={appointment.imageUrl}
            alt="Inspo"
            className="w-14 h-14 object-cover rounded-lg border border-[var(--card-border)] shrink-0"
          />
        )}
      </div>
      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
        <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
          <button
            onClick={() => {
              if (confirm(`Möchtest du den Termin für ${appointment.customerName} wirklich stornieren?`)) {
                onStatusChange('cancelled');
              }
            }}
            className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors"
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
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-amber-100 text-amber-800',
  };

  return (
    <div
      className={`border p-6 rounded-xl transition-all ${
        isNew ? 'border-rose-300 bg-rose-50/50 shadow-sm' : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-[var(--foreground)]">
              {appointment.customerName}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[appointment.status]}`}
            >
              {appointment.status === 'pending' && 'Ausstehend'}
              {appointment.status === 'confirmed' && 'Bestätigt'}
              {appointment.status === 'rejected' && 'Abgelehnt'}
              {appointment.status === 'completed' && 'Abgeschlossen'}
              {appointment.status === 'cancelled' && 'Storniert'}
            </span>
          </div>
          <div className="space-y-1 text-sm text-[var(--muted)]">
            <p>
              <span className="font-medium text-[var(--foreground)]">Datum:</span>{' '}
              {new Date(appointment.date).toLocaleDateString('de-DE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p>
              <span className="font-medium text-[var(--foreground)]">Uhrzeit:</span> {appointment.time} Uhr
            </p>
            {appointment.comment && (
              <p className="mt-3 text-[var(--muted)] italic">{appointment.comment}</p>
            )}
          </div>
          {appointment.imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-[var(--muted)] mb-2">Inspo Bild:</p>
              <img
                src={appointment.imageUrl}
                alt="Inspo"
                className="max-w-xs h-auto border border-[var(--card-border)] rounded-xl"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {isNew && !appointment.seenByAdmin && (
            <button
              onClick={onMarkSeen}
              className="px-3 py-1.5 text-xs font-medium bg-[var(--foreground)] text-white hover:opacity-90 rounded-lg transition-colors"
            >
              Als gesehen markieren
            </button>
          )}
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange('confirmed')}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Bestätigen
              </button>
              <button
                onClick={() => onStatusChange('rejected')}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
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
              className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors"
            >
              Stornieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
