'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail, loginWithGoogle } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLogin() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      setError('');
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      localStorage.setItem('lastAdminLogin', new Date().toISOString());
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      localStorage.setItem('lastAdminLogin', new Date().toISOString());
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
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
        <p className="text-sm text-[var(--muted)] mb-8">Admin-Bereich</p>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="admin@sveaaesthetic.de"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>
            )}
            {resetEmailSent && (
              <p className="text-green-700 text-sm bg-green-50 px-4 py-2 rounded-xl">
                Passwort-Reset-E-Mail wurde gesendet. Bitte prüfe dein Postfach.
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--card-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[var(--card-bg)] text-[var(--muted)]">oder</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full py-3 border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] font-medium rounded-xl hover:bg-[var(--background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Mit Google anmelden
            </button>
          </div>

          <div className="mt-6 space-y-2 text-center">
            <button
              onClick={() => router.push('/admin/reset-password')}
              className="block w-full text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Passwort vergessen?
            </button>
            <button
              onClick={() => router.push('/admin/register')}
              className="block w-full text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Noch keinen Account? Registrieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
