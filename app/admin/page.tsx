'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminOverview from '@/components/AdminOverview';
import CalendarView from '@/components/CalendarView';
import CreateCustomer from '@/components/CreateCustomer';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'customer'>('overview');

  useEffect(() => {
    // Einfache Authentifizierungsprüfung
    if (typeof window !== 'undefined') {
      const isAdmin = sessionStorage.getItem('isAdmin');
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-light text-gray-600">SVEAAESTHETIC</h1>
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm ${
                  activeTab === 'overview'
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-2 transition-colors`}
              >
                Übersicht
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`text-sm ${
                  activeTab === 'calendar'
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-2 transition-colors`}
              >
                Kalender
              </button>
              <button
                onClick={() => setActiveTab('customer')}
                className={`text-sm ${
                  activeTab === 'customer'
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-2 transition-colors`}
              >
                Kundin anlegen
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'customer' && <CreateCustomer />}
      </main>
    </div>
  );
}
