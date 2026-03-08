'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Appointment } from '@/types';

export default function CustomerPage() {
  const params = useParams();
  const customerName = Array.isArray(params.name) ? params.name[0] : params.name;
  const decodedName = decodeURIComponent(customerName || 'Gast');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'backlog'>('upcoming');
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);

  useEffect(() => {
    checkCustomerExists();
    fetchAppointments();
  }, [decodedName]);

  const checkCustomerExists = async () => {
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

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      const customerAppts = (data.appointments || []).filter(
        (apt: Appointment) => apt.customerName === decodedName
      );
      setAppointments(customerAppts);
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm('Möchtest du diesen Termin wirklich stornieren?')) {
      return;
    }
    
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      fetchAppointments();
    } catch (error) {
      console.error('Fehler beim Stornieren:', error);
      alert('Fehler beim Stornieren des Termins. Bitte versuche es erneut.');
    }
  };

  const now = new Date();

  const upcomingAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      return appointmentDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

  const backlogAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      return appointmentDate < now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

  const pendingAppointments = upcomingAppointments.filter(
    apt => apt.status === 'pending'
  );

  if (loading || customerExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--muted)] text-sm">Lädt...</span>
        </div>
      </div>
    );
  }

  if (customerExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-light tracking-tight text-[var(--foreground)] mb-2">SVEAAESTHETIC</h1>
          <p className="text-sm text-[var(--muted)] mb-8">Nagel Design Studio</p>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-4">404 - Seite nicht gefunden</h2>
            <p className="text-[var(--muted)] mb-4">
              Diese Kundenseite ist nicht mehr verfügbar.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Bitte kontaktiere das Studio für weitere Informationen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabStyle = (active: boolean) =>
    `pb-2 px-2 sm:px-4 whitespace-nowrap text-sm sm:text-base font-medium transition-colors ${
      active
        ? 'border-b-2 border-[var(--accent)] text-[var(--foreground)]'
        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
    }`;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-medium text-[var(--foreground)]">
            Hallo {decodedName}!
          </h1>
          <a
            href={`/book/${encodeURIComponent(decodedName)}`}
            className="px-5 py-2.5 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm text-center shadow-sm"
          >
            Neuen Termin buchen
          </a>
        </div>

        {pendingAppointments.length > 0 && (
          <div className="mb-8 p-4 border border-amber-200 bg-amber-50/80 rounded-xl">
            <p className="text-sm text-amber-900">
              Du hast {pendingAppointments.length} ausstehende Termin(e). 
              Bitte warte auf die Bestätigung durch das Studio.
            </p>
          </div>
        )}

        <div className="flex gap-2 sm:gap-4 border-b border-[var(--card-border)] mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={tabStyle(activeTab === 'upcoming')}
          >
            Anstehende ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('backlog')}
            className={tabStyle(activeTab === 'backlog')}
          >
            Vergangene ({backlogAppointments.length})
          </button>
        </div>

        {activeTab === 'upcoming' && (
          <div>
            {upcomingAppointments.length === 0 ? (
              <p className="text-[var(--muted)] py-8">Keine anstehenden Termine</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    canConfirm={false}
                    onCancel={cancelAppointment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'backlog' && (
          <div>
            {backlogAppointments.length === 0 ? (
              <p className="text-[var(--muted)] py-8">Keine vergangenen Termine</p>
            ) : (
              <div className="space-y-4">
                {backlogAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    canConfirm={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  canConfirm = false,
  onCancel,
}: {
  appointment: Appointment;
  canConfirm?: boolean;
  onCancel?: (id: string) => void;
}) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-amber-100 text-amber-800',
  };

  const now = new Date();
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const canCancel = appointmentDate >= now && 
                    (appointment.status === 'confirmed' || appointment.status === 'pending');

  return (
    <div className="border border-[var(--card-border)] p-4 sm:p-6 rounded-xl bg-[var(--card-bg)] hover:shadow-sm transition-all">
      <div className="flex flex-col">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)]">
              {new Date(appointment.date).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
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
          <p className="text-[var(--muted)] mb-2">
            <span className="font-medium text-[var(--foreground)]">Uhrzeit:</span> {appointment.time} Uhr
          </p>
          {appointment.comment && (
            <p className="text-[var(--muted)] italic mt-2">{appointment.comment}</p>
          )}
          {appointment.imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-[var(--muted)] mb-2">Dein Inspo Bild:</p>
              <img
                src={appointment.imageUrl}
                alt="Inspo"
                className="max-w-full sm:max-w-xs h-auto border border-[var(--card-border)] rounded-xl"
              />
            </div>
          )}
        </div>
        {canCancel && onCancel && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <button
              onClick={() => onCancel(appointment.id)}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl transition-colors text-sm"
            >
              Termin stornieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
