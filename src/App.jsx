import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { useAppStore } from './store/useAppStore';
import AuthScreen from './pages/AuthScreen';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { DashboardPet } from './pages/DashboardPet';
import { DashboardOwner } from './pages/DashboardOwner';
import { Rewards } from './pages/Rewards';
import { Settings } from './pages/Settings';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { QuickSwitchBanner } from './components/QuickSwitchBanner';
import { PraiseCardModal } from './components/PraiseCardModal';
import { Heart } from 'lucide-react';

export default function App() {
  const setSession = useAppStore((state) => state.setSession);
  const loadInitialData = useAppStore((state) => state.loadInitialData);
  const session = useAppStore((state) => state.session);
  const user = useAppStore((state) => state.user);
  const activeTab = useAppStore((state) => state.activeTab);
  const activePraiseModal = useAppStore((state) => state.activePraiseModal);
  const setActivePraiseModal = useAppStore((state) => state.setActivePraiseModal);
  
  const [authInitialized, setAuthInitialized] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthInitialized(true);
      return;
    }

    // Check initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthInitialized(true);
    });

    // Listen for dynamic auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session || !isSupabaseConfigured) {
      loadInitialData();
    }
  }, [session, loadInitialData]);

  // Loading state splash
  if (!authInitialized) {
    return (
      <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '50%',
            backgroundImage: 'var(--gradient-hero)',
            color: '#ffffff',
            animation: 'float 2s ease-in-out infinite',
            marginBottom: '1rem'
          }}>
            <Heart size={36} fill="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)' }}>Loading Tamed...</h2>
        </div>
      </div>
    );
  }

  // 1. Supabase configured but user not signed in? Show AuthScreen
  if (isSupabaseConfigured && !session) {
    return (
      <>
        <Toast />
        <AuthScreen />
      </>
    );
  }

  // 2. Signed in (or demo mode) but user hasn't completed Onboarding profile?
  if (!user) {
    return (
      <>
        <Toast />
        <Onboarding />
      </>
    );
  }

  // 3. Fully signed in & profile configured → Render main app shell
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'schedule':
        return user.role === 'owner' ? <DashboardOwner /> : <DashboardPet />;
      case 'rewards':
        return <Rewards />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <QuickSwitchBanner />
      <Toast />
      <PraiseCardModal note={activePraiseModal} onClose={() => setActivePraiseModal(null)} />
      {renderTabContent()}
      <BottomNav />
    </div>
  );
}