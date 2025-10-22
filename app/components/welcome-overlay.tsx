'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/firebase';

export function WelcomeOverlay() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    // Verificar si ya vio el welcome
    const seen = localStorage.getItem('hasSeenWelcome');
    setHasSeenWelcome(seen === 'true');
  }, []);

  useEffect(() => {
    // Mostrar overlay si:
    // 1. No está cargando
    // 2. No hay usuario
    // 3. No ha visto el welcome antes
    if (!loading && !user && !hasSeenWelcome) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [user, loading, hasSeenWelcome]);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setHasSeenWelcome(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Card central */}
      <Card className="relative z-10 max-w-md mx-4 shadow-2xl border-2">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center">
            <Icons.Truck className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            ¡Bienvenido a TachoPause Optimizer!
          </CardTitle>
          <CardDescription className="text-base">
            La mejor herramienta para optimizar tus pausas de conducción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instrucción con flecha animada */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
            <div className="flex-shrink-0">
              <div className="animate-bounce">
                <ArrowLeft className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                Para usar la app, inicia sesión
              </p>
              <p className="text-xs text-muted-foreground">
                Abre el menú lateral y haz clic en "Iniciar Sesión"
              </p>
            </div>
          </div>

          {/* Características */}
          <div className="space-y-3">
            <p className="text-sm font-medium">¿Qué puedes hacer?</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Icons.Play className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Optimiza tus pausas con el temporizador inteligente</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.Calculator className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Calcula rutas y tiempos de viaje</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.History className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Guarda historial de tus pausas</span>
              </li>
            </ul>
          </div>

          {/* Botón de cerrar */}
          <Button 
            onClick={handleClose} 
            className="w-full"
            size="lg"
          >
            Entendido, explorar la app
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Puedes usar algunas funciones sin iniciar sesión
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
