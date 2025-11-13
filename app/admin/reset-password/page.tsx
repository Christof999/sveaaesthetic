'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Senden der Reset-E-Mail. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        <h1 className="text-2xl font-light text-gray-600 mb-8">SVEAAESTHETIC</h1>
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Passwort zurücksetzen</h2>
          
          {success ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                Wir haben eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts an <strong>{email}</strong> gesendet.
              </p>
              <p className="text-sm text-gray-500">
                Bitte prüfe dein Postfach und folge den Anweisungen in der E-Mail.
              </p>
              <button
                onClick={() => router.push('/admin/login')}
                className="w-full py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Zurück zur Anmeldung
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                  placeholder="admin@sveaaesthetic.de"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gib deine Admin-E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen des Passworts.
                </p>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/login')}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird gesendet...' : 'Reset-Link senden'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

