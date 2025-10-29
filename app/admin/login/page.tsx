'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Einfache Authentifizierung (später durch sichere Methode ersetzen)
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem('isAdmin', 'true');
      // Speichere letzten Login-Zeitpunkt
      localStorage.setItem('lastAdminLogin', new Date().toISOString());
      router.push('/admin');
    } else {
      setError('Ungültige Anmeldedaten');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        <h1 className="text-2xl font-light text-gray-600 mb-8">SVEAAESTHETIC</h1>
        <div className="border-t border-gray-200 pt-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Benutzername</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
