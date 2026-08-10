'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import HeroSection from '@/components/HeroSection';
import MarqueeTicker from '@/components/MarqueeTicker';
import RoomsSection from '@/components/RoomsSection';
import AmenitiesSection from '@/components/AmenitiesSection';
import ReviewsSection from '@/components/ReviewsSection';
import LocationSection from '@/components/LocationSection';
import Navbar from '@/components/Navbar';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import LoginModal from '@/components/LoginModal';
import NotificationDrawer from '@/components/NotificationDrawer';
import AdminDashboard from '@/components/AdminDashboard';
import TenantDashboard from '@/components/TenantDashboard';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useAppEffects } from '@/lib/useAppEffects';

export type ViewType = 'landing' | 'admin' | 'tenant';

interface LoggedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  rooms?: any[];
}

export default function Home() {
  const [view, setView] = useState<ViewType>('landing');
  const [role, setRole] = useState<'admin' | 'tenant'>('admin');
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useAppEffects();

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    html.classList.add('theme-transition');
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('kosanku-theme', next);
      return next;
    });
    setTimeout(() => html.classList.remove('theme-transition'), 500);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('kosanku-theme');
    const initialTheme = saved === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const handleLogin = (userData: LoggedUser) => {
    setShowLogin(false);
    setUser(userData);
    setRole(userData.role === 'admin' ? 'admin' : 'tenant');
    setView(userData.role === 'admin' ? 'admin' : 'tenant');
  };

  const switchRole = (newRole: 'admin' | 'tenant') => {
    setRole(newRole);
    setView(newRole);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  return (
    <>
      {/* Top Glowing Scroll Progress Bar */}
      <div 
        id="scrollProgressBar" 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-500 z-[100] transition-all duration-75 shadow-sm shadow-amber-500/50" 
        style={{ width: '0%' }}
      />

      {/* Dynamic background lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-glow -top-40 -left-40 bg-purple-600/10 dark:bg-purple-600/20" />
        <div className="ambient-glow -bottom-40 -right-40 bg-indigo-600/10 dark:bg-indigo-600/20" />
      </div>

      {/* Navbar */}
      <Navbar
        view={view}
        role={role}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
        onSwitchRole={switchRole}
        onToggleNotif={() => setShowNotif((v) => !v)}
        onNavigate={setView}
      />

      {/* Main content */}
      <main className="flex-1 w-full mx-auto space-y-14 sm:space-y-24 relative z-10 pb-16 sm:pb-0">
        {view === 'landing' && (
          <div className="space-y-16 sm:space-y-28 w-full">
            <div className="w-full px-2 sm:px-4 lg:px-6 pt-2">
              <HeroSection 
                onLogin={() => setShowLogin(true)} 
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-28">
              <MarqueeTicker />
              <RoomsSection onLogin={() => setShowLogin(true)} />
              <AmenitiesSection />
              <ReviewsSection />
              <LocationSection />
            </div>
          </div>
        )}
        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <AdminDashboard />
          </div>
        )}
        {view === 'tenant' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <TenantDashboard user={user} />
          </div>
        )}
      </main>

      {/* Floating Mobile Bottom Navigation Dock */}
      {view === 'landing' && (
        <MobileBottomNav onLogin={() => setShowLogin(true)} />
      )}

      {/* WhatsApp widget */}
      <WhatsAppWidget />

      {/* Modals & drawers */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      <NotificationDrawer open={showNotif} onClose={() => setShowNotif(false)} />
    </>
  );
}
