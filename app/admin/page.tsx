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
      router.push('/admin/login');
    }
  };

  const handleTabChange = (tab: 'overview' | 'calendar' | 'customer') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--muted)] text-sm">Lädt...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabStyle = (active: boolean) =>
    `text-sm font-medium pb-2 transition-colors ${
      active
        ? 'text-[var(--foreground)] border-b-2 border-[var(--accent)]'
        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
    }`;

  return (
    <div className="min-h-screen">
      <nav className="bg-[var(--card-bg)] border-b border-[var(--card-border)] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium text-[var(--foreground)] tracking-tight">
                SVEAAESTHETIC
              </h1>
              {user && (
                <span className="text-xs text-[var(--muted)] hidden md:inline truncate max-w-[180px]">
                  {user.email}
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => handleTabChange('overview')} className={tabStyle(activeTab === 'overview')}>
                Übersicht
              </button>
              <button onClick={() => handleTabChange('calendar')} className={tabStyle(activeTab === 'calendar')}>
                Kalender
              </button>
              <button onClick={() => handleTabChange('customer')} className={tabStyle(activeTab === 'customer')}>
                Kundin anlegen
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Abmelden
              </button>
            </div>

            {/* Mobile Burger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col justify-center gap-1.5 w-10 h-10 rounded-lg hover:bg-[var(--card-border)]/50 transition-colors"
              aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
            >
              <span
                className={`block w-5 h-0.5 bg-[var(--foreground)] transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-[var(--foreground)] transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-[var(--foreground)] transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
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
          <div className="px-4 py-4 space-y-1 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
            {(['overview', 'calendar', 'customer'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`block w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab
                    ? 'bg-[var(--accent)]/10 text-[var(--foreground)] font-medium'
                    : 'text-[var(--muted)] hover:bg-[var(--card-border)]/50 hover:text-[var(--foreground)]'
                }`}
              >
                {tab === 'overview' && 'Übersicht'}
                {tab === 'calendar' && 'Kalender'}
                {tab === 'customer' && 'Kundin anlegen'}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-[var(--muted)] hover:bg-[var(--card-border)]/50 hover:text-[var(--foreground)] rounded-xl transition-colors"
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
