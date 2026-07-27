import { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { useAppStore } from './store/useAppStore';
import AuthScreen from './pages/AuthScreen';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home'; 

export default function App() {
  const setSession = useAppStore((state) => state.setSession);
  const loadInitialData = useAppStore((state) => state.loadInitialData);
  const session = useAppStore((state) => state.session);
  const profile = useAppStore((state) => state.profile);
  const isLoading = useAppStore((state) => state.isLoading);
  
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthInitialized(true);
    });

    // Listen for auth changes dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session) {
      loadInitialData();
    }
  }, [session, loadInitialData]);

  if (!authInitialized || (session && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
        Loading Tamed...
      </div>
    );
  }

  // 1. Not signed in? Show the Auth Screen
  if (!session) {
    return <AuthScreen />;
  }

  // 2. Signed in but hasn't created a pet/owner profile? Show Onboarding
  if (!profile) {
    return <Onboarding />;
  }

  // 3. Fully signed in and configured? Load the app shell
  return <Home />;
}