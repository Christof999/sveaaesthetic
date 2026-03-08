'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminAccount } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

export default function AdminRegister() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);

    try {
      await createAdminAccount(email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/login?registered=true');
      }, 2000);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an.');
      } else if (firebaseErr.code === 'auth/invalid-email') {
        setError('Ungültige E-Mail-Adresse.');
      } else if (firebaseErr.code === 'auth/weak-password') {
        setError('Das Passwort ist zu schwach. Bitte verwende ein stärkeres Passwort.');
      } else {
        setError(firebaseErr.message || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--muted)] text-sm">Lädt...</span>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-light tracking-tight text-[var(--foreground)] mb-2">
          SVEAAESTHETIC
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8">Admin-Registrierung</p>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
          <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">Admin-Account erstellen</h2>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-green-800 font-medium">Account erfolgreich erstellt!</p>
                <p className="text-sm text-green-700 mt-2">Du wirst zum Login weitergeleitet...</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--muted)] mb-6">
                Erstelle einen neuen Admin-Account. Nur autorisierte E-Mail-Adressen können sich registrieren.
              </p>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="admin@beispiel.de"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Verwende eine autorisierte Admin-E-Mail-Adresse
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Passwort</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Mindestens 6 Zeichen"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Passwort bestätigen</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Passwort wiederholen"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Wird erstellt...' : 'Account erstellen'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/admin/login')}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Bereits einen Account? Zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
