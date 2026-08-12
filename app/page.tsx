'use client';

import { useEffect, useState, useCallback } from 'react';
import HeroSection from '@/components/HeroSection';
import MarqueeTicker from '@/components/MarqueeTicker';
import RoomsSection from '@/components/RoomsSection';
import AmenitiesSection from '@/components/AmenitiesSection';
import ReviewsSection from '@/components/ReviewsSection';
import LocationSection from '@/components/LocationSection';
import Navbar from '@/components/Navbar';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import LoginView from '@/components/LoginView';
import NotificationDrawer from '@/components/NotificationDrawer';
import AdminDashboard from '@/components/AdminDashboard';
import OwnerDashboard from '@/components/OwnerDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import VendorDashboard from '@/components/VendorDashboard';
import TenantDashboard from '@/components/TenantDashboard';
import MobileBottomNav from '@/components/MobileBottomNav';
import BookingView from '@/components/BookingView';
import SaaSLeadModal from '@/components/SaaSLeadModal';
import SuperadminDashboard from '@/components/SuperadminDashboard';
import { RoomForBooking } from '@/components/BookingModal';
import { useAppEffects } from '@/lib/useAppEffects';

export type RoleType = 'owner' | 'admin' | 'superadmin' | 'employee' | 'vendor' | 'tenant';
export type ViewType = 'landing' | 'login' | 'booking' | RoleType;

interface LoggedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  rooms?: any[];
  avatarUrl?: string;
  avatar?: string;
  avatarBg?: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewType>('landing');
  const [role, setRole] = useState<RoleType>('owner');
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showRegisterOwner, setShowRegisterOwner] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [selectedBookingRoom, setSelectedBookingRoom] = useState<RoomForBooking | null>(null);

  useAppEffects();

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('kosanku_user_session');
    const savedRole = localStorage.getItem('kosanku_user_role') as RoleType;
    const savedView = localStorage.getItem('kosanku_current_view') as ViewType;

    if (savedUser && savedRole && savedView && savedView !== 'landing') {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(savedRole);
        setView(savedView);
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setShowNotif((prev) => !prev);
    };

    (window as any).__toggleNotifDrawer = handleToggle;
    window.addEventListener('toggle_notif_drawer', handleToggle);

    (window as any).__navigateToBookingPage = (roomObj?: RoomForBooking) => {
      setSelectedBookingRoom(roomObj || null);
      setView('booking');
    };
    (window as any).__openOwnerRegister = () => {
      setShowRegisterOwner(true);
    };

    return () => {
      window.removeEventListener('toggle_notif_drawer', handleToggle);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    html.classList.add('theme-transition');
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      if (next === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      localStorage.setItem('kosanku-theme', next);
      localStorage.setItem('kosanku_theme', next);
      return next;
    });
    setTimeout(() => html.classList.remove('theme-transition'), 500);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('kosanku-theme') || localStorage.getItem('kosanku_theme');
    const initialTheme = saved === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = async (userData: LoggedUser) => {
    const assignedRole = (userData.role.toLowerCase() as RoleType) || 'admin';

    // Start with what the API/quick-login gave us
    let mergedUserData = { ...userData };

    // Merge from localStorage profiles as immediate fallback
    try {
      const rawProfiles = localStorage.getItem('kosanku_user_profiles_v2');
      if (rawProfiles) {
        const profiles: Array<{ email: string; avatarUrl?: string; avatar?: string; avatarBg?: string }> = JSON.parse(rawProfiles);
        const matchedProfile = profiles.find(
          (p) => p.email?.toLowerCase() === userData.email?.toLowerCase()
        );
        if (matchedProfile) {
          if (matchedProfile.avatarUrl && !mergedUserData.avatarUrl) mergedUserData = { ...mergedUserData, avatarUrl: matchedProfile.avatarUrl };
          if (matchedProfile.avatar && !mergedUserData.avatar) mergedUserData = { ...mergedUserData, avatar: matchedProfile.avatar };
          if (matchedProfile.avatarBg && !mergedUserData.avatarBg) mergedUserData = { ...mergedUserData, avatarBg: matchedProfile.avatarBg };
        }
      }
    } catch (e) {
      // ignore
    }

    // Await DB fetch FIRST — get avatarUrl before navigating to dashboard
    // This prevents the race condition where SequenceSaaSLayout reads localStorage
    // before the async DB fetch completes.
    if (userData.email) {
      try {
        const res = await fetch(`/api/users/profile?email=${encodeURIComponent(userData.email)}`);
        const json = await res.json();
        if (json?.data?.avatarUrl) {
          mergedUserData = { ...mergedUserData, avatarUrl: json.data.avatarUrl };
        }
        if (json?.data?.avatar && !mergedUserData.avatar) {
          mergedUserData = { ...mergedUserData, avatar: json.data.avatar };
        }
      } catch {
        // DB optional — use what we have
      }
    }

    // NOW save session and navigate — localStorage is complete before SequenceSaaSLayout mounts
    setUser(mergedUserData);
    localStorage.setItem('kosanku_user_session', JSON.stringify(mergedUserData));
    localStorage.setItem('kosanku_user_role', assignedRole);
    localStorage.setItem('kosanku_current_view', assignedRole);
    setRole(assignedRole);
    setView(assignedRole);
  };



  const switchRole = (newRole: RoleType) => {
    setRole(newRole);
    setView(newRole);
    localStorage.setItem('kosanku_user_role', newRole);
    localStorage.setItem('kosanku_current_view', newRole);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    localStorage.removeItem('kosanku_user_session');
    localStorage.removeItem('kosanku_user_role');
    localStorage.removeItem('kosanku_current_view');
  };

  return (
    <>
      {/* Background container */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />

      {/* Main content */}
      <main className="flex-1 w-full mx-auto space-y-14 sm:space-y-24 relative z-10 pb-16 sm:pb-0">
        {view === 'landing' && (
          <div className="space-y-16 sm:space-y-28 w-full">
            <div className="w-full px-2 sm:px-4 lg:px-6 pt-2">
              <HeroSection 
                onLogin={() => setView('login')} 
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-28">
              <MarqueeTicker />
              <RoomsSection 
                onLogin={() => setView('login')} 
                onOpenBookingPage={(roomObj) => {
                  setSelectedBookingRoom(roomObj);
                  setView('booking');
                }}
              />
              <AmenitiesSection />
              <ReviewsSection />
              <LocationSection />
            </div>
          </div>
        )}
        {view === 'login' && (
          <LoginView
            onClose={() => setView('landing')}
            onLogin={handleLogin}
          />
        )}
        {view === 'booking' && (
          <BookingView
            room={selectedBookingRoom}
            onClose={() => setView('landing')}
            onBookingSuccess={(roomId) => {
              console.log('Booking successful for room:', roomId);
            }}
          />
        )}
        {view === 'owner' && (
          <OwnerDashboard
            onSwitchRole={(r) => {
              setRole(r);
              setView(r);
            }}
            onLogout={() => setView('landing')}
          />
        )}
        {view === 'superadmin' && (
          <SuperadminDashboard />
        )}
        {view === 'admin' && (
          <AdminDashboard
            onSwitchRole={(r) => {
              setRole(r);
              setView(r);
            }}
            onLogout={() => setView('landing')}
          />
        )}
        {view === 'employee' && (
          <EmployeeDashboard
            onSwitchRole={(r) => {
              setRole(r);
              setView(r);
            }}
            onLogout={() => setView('landing')}
          />
        )}
        {view === 'vendor' && (
          <VendorDashboard
            onSwitchRole={(r) => {
              setRole(r);
              setView(r);
            }}
            onLogout={() => setView('landing')}
          />
        )}
        {view === 'tenant' && (
          <TenantDashboard
            user={user}
            onSwitchRole={(r) => {
              setRole(r);
              setView(r);
            }}
            onLogout={() => setView('landing')}
          />
        )}
      </main>

      {/* Floating Mobile Bottom Navigation Dock */}
      {view === 'landing' && (
        <MobileBottomNav onLogin={() => setView('login')} />
      )}

      {/* WhatsApp AI Assistant widget (Only for Landing frontend and Tenant portal) */}
      {(view === 'landing' || view === 'tenant') && (
        <WhatsAppWidget />
      )}

      {/* Rincian Notification Drawer Slide-over */}
      <NotificationDrawer open={showNotif} onClose={() => setShowNotif(false)} role={user?.role || role} />

      {/* SaaS Partnership Lead Offer Modal */}
      {showRegisterOwner && (
        <SaaSLeadModal
          onClose={() => setShowRegisterOwner(false)}
        />
      )}
    </>
  );
}
