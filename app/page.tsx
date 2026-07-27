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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useAppEffects();

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    html.classList.add('theme-transition');
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'light') html.setAttribute('data-theme', 'light');
      else html.removeAttribute('data-theme');
      localStorage.setItem('kosanku-theme', next);
      return next;
    });
    setTimeout(() => html.classList.remove('theme-transition'), 500);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('kosanku-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      setTheme('light');
    }
  }, []);

  const handleLogin = (userData: LoggedUser) => {
    setShowLogin(false);
    setUser(userData);
    const r = userData.role === 'ADMIN' ? 'admin' : 'tenant';
    setRole(r);
    setView(r);
  };

  const switchRole = (r: 'admin' | 'tenant') => {
    setRole(r);
    setView(r);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  return (
    <>
      {/* Ambient orbs */}
      <div className="parallax-orb fixed -top-24 -left-24 sm:-top-32 sm:-left-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-orchid-violet/8 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-morph" />
      <div className="parallax-orb fixed -bottom-32 -right-32 sm:-bottom-40 sm:-right-40 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-orchid-glow/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none animate-float-slow" />
      <div className="parallax-orb fixed top-1/3 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-orchid-gold/4 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none animate-float-delay" />

      {/* Cursor glow */}
      <div id="cursorGlow" className="cursor-glow hidden lg:block" />

      {/* Particles */}
      <div id="particlesContainer" className="particles-container" />

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-14 sm:space-y-24 relative z-10">
        {view === 'landing' && (
          <div className="space-y-16 sm:space-y-28">
            <HeroSection onLogin={() => setShowLogin(true)} />
            <MarqueeTicker />
            <RoomsSection onLogin={() => setShowLogin(true)} />
            <AmenitiesSection />
            <ReviewsSection />
            <LocationSection />
          </div>
        )}
        {view === 'admin' && <AdminDashboard />}
        {view === 'tenant' && <TenantDashboard user={user} />}
      </main>

      {/* WhatsApp widget */}
      <WhatsAppWidget />

      {/* Modals & drawers */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      <NotificationDrawer open={showNotif} onClose={() => setShowNotif(false)} />
    </>
  );
}
