'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { MainSidebar } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        {children}
      </div>
    </div>
  );
}
