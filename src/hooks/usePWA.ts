import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  showInstallPrompt: boolean;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    showInstallPrompt: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');

    setPwaState(prev => ({ ...prev, isInstalled }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setPwaState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      setPwaState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false,
        showInstallPrompt: false 
      }));
      setDeferredPrompt(null);
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
    };

    // Track user interaction for install prompt
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        // Show install prompt after user interaction if installable
        setTimeout(() => {
          if (deferredPrompt && !pwaState.isInstalled) {
            setPwaState(prev => ({ ...prev, showInstallPrompt: true }));
          }
        }, 3000); // Show after 3 seconds of interaction
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // User interaction events
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('scroll', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered successfully', registration);
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [deferredPrompt, pwaState.isInstalled, userInteracted]);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA: Install prompt result:', outcome);
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({ ...prev, showInstallPrompt: false }));
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install prompt failed', error);
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setPwaState(prev => ({ ...prev, showInstallPrompt: false }));
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Barbear.IA',
          text: 'Sistema completo de gestão para barbearias',
          url: window.location.origin
        });
        return true;
      } catch (error) {
        console.error('PWA: Share failed', error);
        return false;
      }
    }
    return false;
  };

  return {
    ...pwaState,
    installApp,
    dismissInstallPrompt,
    shareApp,
    canShare: !!navigator.share
  };
}