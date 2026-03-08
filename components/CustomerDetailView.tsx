'use client';

import { useState, useEffect } from 'react';
import { Customer, Appointment } from '@/types';

interface CustomerDetailViewProps {
  customer: Customer;
  onClose: () => void;
}

export default function CustomerDetailView({ customer, onClose }: CustomerDetailViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'backlog'>('upcoming');

  useEffect(() => {
    fetchAppointments();
  }, [customer.id]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      // Filtere nur Termine dieser Kundin
      const customerAppts = (data.appointments || []).filter(
        (apt: Appointment) => apt.customerName === customer.name
      );
      setAppointments(customerAppts);
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
    } finally {
      setLoading(false);
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
      alert('Fehler beim Aktualisieren des Termins. Bitte versuche es erneut.');
    }
  };

  const now = new Date();

  // Zukünftige Termine
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

  // Vergangene Termine (Backlog)
  const backlogAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      return appointmentDate < now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime(); // Neueste zuerst
    });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--muted)] text-sm">Lädt...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card-bg)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-medium text-[var(--foreground)]">{customer.name}</h2>
            {customer.email && (
              <p className="text-sm text-[var(--muted)] mt-1">{customer.email}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/50 rounded-xl transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-[var(--card-border)] mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              } transition-colors`}
            >
              Anstehende Termine ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('backlog')}
              className={`pb-2 px-4 font-medium ${
                activeTab === 'backlog'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              } transition-colors`}
            >
              Vergangene Termine ({backlogAppointments.length})
            </button>
          </div>

          {/* Anstehende Termine */}
          {activeTab === 'upcoming' && (
            <div>
              {upcomingAppointments.length === 0 ? (
                <p className="text-[var(--muted)]">Keine anstehenden Termine</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AdminAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onStatusChange={(status) => updateStatus(appointment.id, status)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vergangene Termine */}
          {activeTab === 'backlog' && (
            <div>
              {backlogAppointments.length === 0 ? (
                <p className="text-[var(--muted)]">Keine vergangenen Termine</p>
              ) : (
                <div className="space-y-4">
                  {backlogAppointments.map((appointment) => (
                    <AdminAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onStatusChange={(status) => updateStatus(appointment.id, status)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminAppointmentCard({
  appointment,
  onStatusChange,
}: {
  appointment: Appointment;
  onStatusChange: (status: Appointment['status']) => void;
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
  const isPast = appointmentDate < now;

  return (
    <div className="border border-[var(--card-border)] p-6 rounded-xl bg-[var(--card-bg)] hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="text-lg font-medium text-[var(--foreground)]">
              {new Date(appointment.date).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusColors[appointment.status]}`}
            >
              {appointment.status === 'pending' && '⏳ Ausstehend'}
              {appointment.status === 'confirmed' && '✅ Bestätigt'}
              {appointment.status === 'rejected' && '❌ Abgelehnt'}
              {appointment.status === 'completed' && '✓ Abgeschlossen'}
              {appointment.status === 'cancelled' && '🚫 Storniert'}
            </span>
            {isPast && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                Vergangen
              </span>
            )}
          </div>
          <p className="text-[var(--muted)] mb-2">
            <span className="font-medium">Uhrzeit:</span> {appointment.time} Uhr
          </p>
          {appointment.comment && (
            <p className="text-[var(--muted)] italic mt-2">{appointment.comment}</p>
          )}
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
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange('confirmed')}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Bestätigen
              </button>
              <button
                onClick={() => onStatusChange('rejected')}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Ablehnen
              </button>
            </>
          )}
          {(appointment.status === 'confirmed' || appointment.status === 'pending') && !isPast && (
            <button
              onClick={() => {
                if (confirm(`Möchtest du diesen Termin wirklich stornieren?`)) {
                  onStatusChange('cancelled');
                }
              }}
              className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Stornieren
            </button>
          )}
          {appointment.status === 'confirmed' && isPast && (
            <button
              onClick={() => onStatusChange('completed')}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Als erledigt markieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

