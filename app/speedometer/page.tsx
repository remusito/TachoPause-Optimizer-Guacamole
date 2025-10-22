'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { SettingsSheet } from '../components/settings-sheet';
import { cn } from '@/lib/utils';
import { useAchievements } from '@/hooks/use-achievements-provider';
import { addHistoryItem } from '@/lib/data';
import { useAuth, useFirestore } from '@/firebase';

// Helper to calculate distance between two lat/lon points in meters (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
};

export default function SpeedometerPage() {
  const [speed, setSpeed] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const [maxSpeed, setMaxSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const speedSamplesRef = useRef<number[]>([]);

  const { user } = useAuth();
  const db = useFirestore();
  const { updateAchievementProgress, incrementAchievementProgress } = useAchievements();

  const handleSuccess: PositionCallback = (position) => {
    const currentSpeed = position.coords.speed;
    const speedKmh = currentSpeed ? Math.round(currentSpeed * 3.6) : 0;
    
    setSpeed(speedKmh);
    setError(null);
    
    if (speedKmh > maxSpeed) {
      setMaxSpeed(speedKmh);
      updateAchievementProgress('speeder', speedKmh);
      updateAchievementProgress('supersonic', speedKmh);
    }

    // Calculate distance
    if (lastPositionRef.current) {
      const newDistance = calculateDistance(
        lastPositionRef.current.coords.latitude,
        lastPositionRef.current.coords.longitude,
        position.coords.latitude,
        position.coords.longitude
      );
      const newTotalDistance = distance + newDistance;
      setDistance(newTotalDistance);
      updateAchievementProgress('marathoner', newTotalDistance / 1000);
    }
    lastPositionRef.current = position;

    // Calculate average speed
    if (speedKmh > 0) {
      speedSamplesRef.current.push(speedKmh);
      const totalSpeed = speedSamplesRef.current.reduce((sum, s) => sum + s, 0);
      setAverageSpeed(Math.round(totalSpeed / speedSamplesRef.current.length));
    }
  };

  const handleError: PositionErrorCallback = (err) => {
    let errorMessage = 'Error desconocido al obtener la ubicación.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Permiso de geolocalización denegado.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Información de ubicación no disponible.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Se agotó el tiempo de espera para obtener la ubicación.';
        break;
    }
    setError(errorMessage);
    toast({
      title: 'Error de GPS',
      description: errorMessage,
      variant: 'destructive',
    });
    stopTracking(false);
  };

  const resetStats = () => {
      setSpeed(0);
      setMaxSpeed(0);
      setAverageSpeed(0);
      setDistance(0);
      setElapsedTime(0);
      setStartTime(null);
      lastPositionRef.current = null;
      speedSamplesRef.current = [];
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no es compatible con este navegador.');
      toast({
        title: 'Error de compatibilidad',
        description: 'La geolocalización no es compatible con este navegador.',
        variant: 'destructive',
      });
      return;
    }
    
    resetStats();
    setIsTracking(true);
    setStartTime(Date.now());
    toast({
      title: 'GPS Activado',
      description: 'Iniciando seguimiento de velocidad y distancia.',
    });
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopTracking = (showToast = true) => {
    setIsTracking(false);
    
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Save the session to Firestore if the user is logged in and there's data
    if (user && db && distance > 0 && elapsedTime > 0) {
      addHistoryItem(db, user.uid, {
        type: 'conduccion',
        duration: Math.floor(elapsedTime / 1000),
        distance: distance / 1000, // convert meters to km
        status: 'completado',
      });
      if (showToast) {
        toast({
          title: 'Sesión Guardada',
          description: `Viaje de ${(distance / 1000).toFixed(2)} km guardado en tu historial.`,
        });
      }
    } else if (showToast) {
      toast({
        title: 'GPS Desactivado',
        description: 'Seguimiento detenido.',
        variant: 'destructive',
      });
    }

    // Reset stats for the next session
    resetStats();
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTracking && startTime) {
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setElapsedTime(elapsed);
        if (user) incrementAchievementProgress('explorer', 1); // Increment by 1 second
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTracking, startTime, incrementAchievementProgress, user]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="w-full p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Speedometer className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            Velocímetro GPS
          </h1>
        </div>
        <SettingsSheet />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center w-full p-4 gap-6">
        <Card className="w-full max-w-md text-center border-none shadow-lg bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Velocidad Actual</CardTitle>
            {error && <CardDescription className="text-destructive">{error}</CardDescription>}
          </CardHeader>
          <CardContent className="flex justify-center items-center py-4">
            <div className="relative w-48 sm:w-56 h-48 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 250 250">
                <circle cx="125" cy="125" r="100" className="stroke-border" strokeWidth="15" fill="transparent" />
                <circle
                  cx="125"
                  cy="125"
                  r="100"
                  className={cn('transition-all duration-300', isTracking ? 'stroke-primary' : 'stroke-muted')}
                  strokeWidth="15"
                  fill="transparent"
                  strokeDasharray="628.32"
                  strokeDashoffset={628.32 - (speed / 150) * 628.32} // Max speed 150km/h
                  strokeLinecap="round"
                  transform="rotate(-90 125 125)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl sm:text-7xl font-bold font-headline tracking-tighter text-primary">
                  {speed}
                </span>
                <span className="text-base sm:text-lg text-muted-foreground">km/h</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              size="lg"
              className="w-full max-w-[200px]"
              onClick={handleToggleTracking}
              variant={isTracking ? 'destructive' : 'default'}
            >
              {isTracking ? <Icons.Pause className="mr-2 h-5 w-5" /> : <Icons.Play className="mr-2 h-5 w-5" />}
              {isTracking ? 'Detener' : 'Iniciar'}
            </Button>
            {!user && <p className="text-sm text-muted-foreground">Inicia sesión para guardar tus viajes</p>}
          </CardFooter>
        </Card>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Resumen de la Sesión Actual</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg">
              <Icons.Gauge className="h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Vel. Máxima</p>
              <p className="font-bold text-lg">{maxSpeed} <span className="text-base font-normal">km/h</span></p>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg">
              <Icons.Gauge className="h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Vel. Media</p>
              <p className="font-bold text-lg">{averageSpeed} <span className="text-base font-normal">km/h</span></p>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg">
              <Icons.Milestone className="h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Distancia</p>
              <p className="font-bold text-lg">{(distance / 1000).toFixed(2)} <span className="text-base font-normal">km</span></p>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg">
              <Icons.Timer className="h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Tiempo</p>
              <p className="font-bold text-lg">{formatTime(elapsedTime)}</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="w-full text-center p-4 border-t">
        <p className="text-sm text-muted-foreground">
          La precisión de la velocidad depende del GPS de tu dispositivo.
        </p>
      </footer>
    </div>
  );
}
