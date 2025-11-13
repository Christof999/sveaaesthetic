'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminOverview from '@/components/AdminOverview';
import CalendarView from '@/components/CalendarView';
import CreateCustomer from '@/components/CreateCustomer';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'customer'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
      // Fallback: Auch ohne Firebase Auth abmelden
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Wird zu Login weitergeleitet
  }

  const handleTabChange = (tab: 'overview' | 'calendar' | 'customer') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Schließe Menü nach Auswahl auf Mobile
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-light text-gray-600">SVEAAESTHETIC</h1>
              {user && (
                <span className="text-xs text-gray-500 hidden md:inline">
                  {user.email}
                </span>
              )}
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleTabChange('overview')}
                className={`text-sm ${
                  activeTab === 'overview'
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-2 transition-colors`}
              >
                Übersicht
              </button>
              <button
                onClick={() => handleTabChange('calendar')}
                className={`text-sm ${
                  activeTab === 'calendar'
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-2 transition-colors`}
              >
                Kalender
              </button>
              <button
                onClick={() => handleTabChange('customer')}
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
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Abmelden
              </button>
            </div>

            {/* Mobile Burger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Menu"
            >
              <span
                className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-4 space-y-3 border-t border-gray-200 bg-white">
            <button
              onClick={() => handleTabChange('overview')}
              className={`block w-full text-left px-4 py-3 rounded transition-colors ${
                activeTab === 'overview'
                  ? 'bg-gray-100 text-gray-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => handleTabChange('calendar')}
              className={`block w-full text-left px-4 py-3 rounded transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-gray-100 text-gray-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Kalender
            </button>
            <button
              onClick={() => handleTabChange('customer')}
              className={`block w-full text-left px-4 py-3 rounded transition-colors ${
                activeTab === 'customer'
                  ? 'bg-gray-100 text-gray-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Kundin anlegen
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'customer' && <CreateCustomer />}
      </main>
    </div>
  );
}
