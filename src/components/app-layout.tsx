'use client';

import { useState } from 'react';
import { MainSidebar } from '@/components/main-sidebar';
import { Menu, X } from 'lucide-react';
import { SettingsSheet } from '@/app/components/settings-sheet';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  showSettings?: boolean;
}

// Lista de páginas donde el menú lateral empieza oculto y el botón es visible
const pagesWithHiddenSidebar = [
  'Velocímetro GPS',
  'Calculadora de Ruta',
  'Buscador de Paradas',
  'Mercancías',
  'Contactos',
  'Historial',
  'Recompensas',
  'Reglamento',
  'Mantenimiento Preventivo',
];

export function AppLayout({ children, title, showSettings = true }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Determinar si el menú debe estar oculto en escritorio para esta página
  const shouldHideSidebarOnDesktop = pagesWithHiddenSidebar.includes(title);

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Botón de menú flotante: siempre visible en móvil, condicional en escritorio */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 left-4 z-50 p-2 text-foreground bg-background/80 backdrop-blur-sm rounded-md border shadow-md transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-64' : 'translate-x-0'
        } ${shouldHideSidebarOnDesktop ? '' : 'md:hidden'}`}
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${!shouldHideSidebarOnDesktop ? 'md:translate-x-0' : '-translate-x-full'}`}
      >
        <MainSidebar />
      </aside>

      {/* Contenido Principal */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        !shouldHideSidebarOnDesktop ? 'md:pl-64' : 'md:pl-0'
      }`}>
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-center h-16 px-4 sm:px-6 relative">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              {title}
            </h1>
            <div className="absolute right-4 sm:right-6">
              {showSettings ? <SettingsSheet /> : <div className="w-8 h-8" />}{/* Placeholder para alinear */}
            </div>
          </div>
        </header>

        <main className={`flex-1 p-4 sm:p-6 md:p-8 ${
          shouldHideSidebarOnDesktop ? 'md:flex md:flex-col md:items-center' : ''
        }`}>
          <div className="w-full max-w-4xl">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para cerrar el menú en móvil */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 bg-black/40 z-30 ${shouldHideSidebarOnDesktop ? '' : 'md:hidden'}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
