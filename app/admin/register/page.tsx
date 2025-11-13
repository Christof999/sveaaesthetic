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

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validierung
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
      // Nach 2 Sekunden zum Login weiterleiten
      setTimeout(() => {
        router.push('/admin/login?registered=true');
      }, 2000);
    } catch (err: any) {
      console.error('Registrierungsfehler:', err);
      
      // Spezifische Fehlermeldungen
      if (err.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Ungültige E-Mail-Adresse.');
      } else if (err.code === 'auth/weak-password') {
        setError('Das Passwort ist zu schwach. Bitte verwende ein stärkeres Passwort.');
      } else {
        setError(err.message || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        <h1 className="text-2xl font-light text-gray-600 mb-8">SVEAAESTHETIC</h1>
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Admin-Account erstellen</h2>
          
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800">
                  ✅ Account erfolgreich erstellt!
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Du wirst zum Login weitergeleitet...
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Erstelle einen neuen Admin-Account. Nur autorisierte E-Mail-Adressen können sich registrieren.
              </p>
              
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                    placeholder="christof.didi@googlemail.com"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verwende eine autorisierte Admin-E-Mail-Adresse
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Passwort</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                    placeholder="Mindestens 6 Zeichen"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Passwort bestätigen</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                    placeholder="Passwort wiederholen"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird erstellt...' : 'Account erstellen'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/admin/login')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Bereits einen Account? Zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

