import React from 'react';
import { useAppStore } from './store/useAppStore';
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

export function App() {
  const { user, activeTab, activePraiseModal, setActivePraiseModal } = useAppStore();

  if (!user) {
    return (
      <>
        <Toast />
        <Onboarding />
      </>
    );
  }

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

export default App;
