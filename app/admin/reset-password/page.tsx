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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der Reset-E-Mail. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-light tracking-tight text-[var(--foreground)] mb-2">
          SVEAAESTHETIC
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8">Passwort zurücksetzen</p>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
          <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">Passwort zurücksetzen</h2>

          {success ? (
            <div className="space-y-4">
              <p className="text-[var(--foreground)]">
                Wir haben eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts an{' '}
                <strong>{email}</strong> gesendet.
              </p>
              <p className="text-sm text-[var(--muted)]">
                Bitte prüfe dein Postfach und folge den Anweisungen in der E-Mail.
              </p>
              <button
                onClick={() => router.push('/admin/login')}
                className="w-full py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
              >
                Zurück zur Anmeldung
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="admin@sveaaesthetic.de"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-[var(--muted)] mt-1">
                  Gib deine Admin-E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen des Passworts.
                </p>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/login')}
                  className="flex-1 py-3 border border-[var(--card-border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-[var(--card-border)]/50 transition-colors"
                  disabled={loading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
