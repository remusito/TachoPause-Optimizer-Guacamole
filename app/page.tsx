'use client';

import { useState, useEffect } from 'react';
import { PauseTracker } from '@/app/components/pause-tracker';
import { Icons } from '@/components/icons';
import { SettingsSheet } from '@/app/components/settings-sheet';
import { usePremium } from '@/hooks/use-premium';
import { MainSidebar } from '@/components/ui/sidebar';
import { FooterWithAd } from './components/footer-with-ad';
import { WelcomeOverlay } from './components/welcome-overlay';
import { useAchievements } from '@/hooks/use-achievements-provider';
import { Menu } from 'lucide-react';

export default function Home() {
  const { isPremium } = usePremium();
  const { trackAppUsage } = useAchievements();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    trackAppUsage();
  }, [trackAppUsage]);

  return (
    <div className="flex min-h-dvh relative">
      {/* Botón hamburguesa solo visible en móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 md:hidden fixed top-4 left-4 z-50 bg-muted rounded-lg shadow"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Sidebar responsive */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-background shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:w-64 md:flex`}
      >
        <MainSidebar />
      </div>

      {/* Fondo oscuro cuando el menú está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col bg-background text-foreground overflow-hidden">
        <header className="w-full p-4 sm:p-6 flex items-center justify-between flex-shrink-0 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <Icons.Truck className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              TachoPause{' '}
              {isPremium ? (
                <span className="text-primary">Premium</span>
              ) : (
                <span>Optimizer</span>
              )}
            </h1>
          </div>
          <SettingsSheet />
        </header>

        <main className="flex-1 w-full px-4 overflow-y-auto">
          <div className="w-full max-w-md mx-auto py-6 flex flex-col gap-6">
            <PauseTracker />
          </div>
        </main>

        {!isPremium && (
          <div className="w-full text-center py-2 flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              Hecho con ❤️ para los héroes de la carretera.
            </p>
          </div>
        )}

        <div className="flex-shrink-0">
          <FooterWithAd />
        </div>
      </div>

      <WelcomeOverlay />
    </div>
  );
}
