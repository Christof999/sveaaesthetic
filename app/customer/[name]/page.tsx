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
  }, []);

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
      // Filtere nur Termine dieser Kundin
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
      fetchAppointments(); // Refresh
    } catch (error) {
      console.error('Fehler beim Stornieren:', error);
      alert('Fehler beim Stornieren des Termins. Bitte versuche es erneut.');
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

  // Offene Bestätigungen
  const pendingAppointments = upcomingAppointments.filter(
    apt => apt.status === 'pending'
  );

  if (loading || customerExists === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  // Zeige 404 wenn Kundin nicht existiert
  if (customerExists === false) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-light text-gray-600 mb-8">SVEAAESTHETIC</h1>
          <div className="border border-gray-200 p-8">
            <h2 className="text-xl font-medium text-gray-800 mb-4">404 - Seite nicht gefunden</h2>
            <p className="text-gray-600 mb-4">
              Diese Kundenseite ist nicht mehr verfügbar.
            </p>
            <p className="text-sm text-gray-500">
              Bitte kontaktiere das Studio für weitere Informationen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light text-gray-600">
            Hallo {decodedName}!
          </h1>
          <a
            href={`/book/${encodeURIComponent(decodedName)}`}
            className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm"
          >
            Neuen Termin buchen
          </a>
        </div>

        {/* Info-Box für ausstehende Termine */}
        {pendingAppointments.length > 0 && (
          <div className="mb-8 p-4 border border-yellow-300 bg-yellow-50 rounded">
            <p className="text-sm text-gray-700">
              ⏳ Du hast {pendingAppointments.length} ausstehende Termin(e). 
              Bitte warte auf die Bestätigung durch das Studio.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-2 px-4 ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-gray-800 text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            Anstehende Termine ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('backlog')}
            className={`pb-2 px-4 ${
              activeTab === 'backlog'
                ? 'border-b-2 border-gray-800 text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            Vergangene Termine ({backlogAppointments.length})
          </button>
        </div>

        {/* Anstehende Termine */}
        {activeTab === 'upcoming' && (
          <div>
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-400">Keine anstehenden Termine</p>
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

        {/* Backlog */}
        {activeTab === 'backlog' && (
          <div>
            {backlogAppointments.length === 0 ? (
              <p className="text-gray-400">Keine vergangenen Termine</p>
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
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-orange-100 text-orange-800',
  };

  const now = new Date();
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const canCancel = appointmentDate >= now && 
                    (appointment.status === 'confirmed' || appointment.status === 'pending');

  return (
    <div className="border border-gray-200 p-6 rounded hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-medium text-gray-800">
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
          </div>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Uhrzeit:</span> {appointment.time} Uhr
          </p>
          {appointment.comment && (
            <p className="text-gray-500 italic mt-2">{appointment.comment}</p>
          )}
          {appointment.imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Dein Inspo Bild:</p>
              <img
                src={appointment.imageUrl}
                alt="Inspo"
                className="max-w-xs h-auto border border-gray-200 rounded"
              />
            </div>
          )}
        </div>
        {canCancel && onCancel && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onCancel(appointment.id)}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
            >
              Termin stornieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

