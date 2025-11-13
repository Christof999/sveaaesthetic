'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import CustomerDetailView from './CustomerDetailView';

interface CreateCustomerProps {
  onSuccess?: () => void;
}

export default function CreateCustomer({ onSuccess }: CreateCustomerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Fehler beim Laden der Kundinnen:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending customer data:', { name, email: email || undefined });
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          email: email.trim() || undefined, // Nur senden wenn nicht leer
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Anlegen des Kunden');
      }

      console.log('Customer created successfully');
      setName('');
      setEmail('');
      await fetchCustomers(); // Liste aktualisieren
      if (onSuccess) {
        onSuccess();
      }
      alert('Kundin erfolgreich angelegt!');
    } catch (err) {
      console.error('Error creating customer:', err);
      setError('Fehler beim Anlegen des Kunden: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Neue Kundin anlegen</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
              placeholder="Name der Kundin"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              E-Mail <span className="text-gray-400 text-xs">(optional - für Benachrichtigungen)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
              placeholder="kundin@example.com"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Wird erstellt...' : 'Kundin anlegen'}
          </button>
        </form>
      </div>

      <div className="border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Bestehende Kundinnen</h3>
        {customers.length === 0 ? (
          <p className="text-gray-400">Noch keine Kundinnen angelegt</p>
        ) : (
          <div className="space-y-2">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="border border-gray-200 p-4 hover:border-gray-300 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="text-gray-800 font-medium hover:text-gray-600 transition-colors text-left"
                  >
                    {customer.name}
                  </button>
                  {customer.email && (
                    <p className="text-sm text-gray-500 mt-1">{customer.email}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const response = await fetch(`/api/qrcode/${customer.id}?name=${encodeURIComponent(customer.name)}`);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${customer.name}-QRCode.html`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    }}
                    className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm"
                  >
                    QR Code generieren
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Möchtest du die Kundin "${customer.name}" wirklich löschen? Sie kann danach keine neuen Termine mehr buchen.`)) {
                        return;
                      }
                      
                      try {
                        const response = await fetch(`/api/customers/${customer.id}`, {
                          method: 'DELETE',
                        });
                        
                        if (!response.ok) {
                          throw new Error('Fehler beim Löschen der Kundin');
                        }
                        
                        await fetchCustomers(); // Liste aktualisieren
                        alert('Kundin erfolgreich gelöscht');
                      } catch (err) {
                        console.error('Error deleting customer:', err);
                        alert('Fehler beim Löschen der Kundin: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailView
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
