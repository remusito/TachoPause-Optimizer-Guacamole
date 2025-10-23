'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, MoveRight, Info } from "lucide-react";
import { toast } from "sonner";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useAuth } from '@/firebase/auth/provider';
import { startWorkday, logWorkdayEvent, updateWorkdayTimes } from '@/app/workdays/actions';
// Import the serializable type for data coming from server actions
import type { SerializableWorkday } from '@/types/workday';

// --- Helper Functions ---
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const SPEED_THRESHOLD_KMH = 5; // Speed threshold to consider the vehicle as moving
const TIME_UPDATE_INTERVAL_MS = 5000; // Update server every 5 seconds

// --- Main Component ---
export function WorkdayTracker() {
  const { user } = useAuth();
  // Use the SerializableWorkday type for state that holds server action results
  const [activeWorkday, setActiveWorkday] = useState<SerializableWorkday | null>(null);
  const [isWorkdayActive, setIsWorkdayActive] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Timers and acumulaters
  const [drivingTime, setDrivingTime] = useState(0);
  const lastTimeUpdateRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to get latest values inside intervals
  const isMovingRef = useRef(isMoving);
  isMovingRef.current = isMoving;

  // --- GPS Speed Detection Effect ---
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      toast.error("Geolocalización no soportada en tu navegador.");
      return;
    }

    let lastMovementState = false;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const speedKmh = (position.coords.speed || 0) * 3.6;
        setCurrentSpeed(speedKmh);
        const currentlyMoving = speedKmh > SPEED_THRESHOLD_KMH;
        setIsMoving(currentlyMoving);

        if (user && activeWorkday && currentlyMoving !== lastMovementState) {
          logWorkdayEvent(user.uid, activeWorkday.id, currentlyMoving ? 'MOVEMENT_START' : 'MOVEMENT_STOP');
          lastMovementState = currentlyMoving;
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Permiso de geolocalización denegado. El contador de jornada no funcionará.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, activeWorkday]);

  // --- Server Time Update Effect ---
  useEffect(() => {
    const updateServer = async () => {
      if (!user || !activeWorkday || drivingTime === 0) return;
      
      await updateWorkdayTimes(user.uid, activeWorkday.id, { drivingTime });
      setDrivingTime(0); // Reset accumulator after updating
    };

    const serverUpdateInterval = setInterval(updateServer, TIME_UPDATE_INTERVAL_MS);
    return () => clearInterval(serverUpdateInterval);
  }, [user, activeWorkday, drivingTime]);


  // --- Main Timer Logic ---
   useEffect(() => {
    if (isWorkdayActive) {
      intervalRef.current = setInterval(() => {
        if (isMovingRef.current) {
           setDrivingTime(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => { if(intervalRef.current) clearInterval(intervalRef.current) };
  }, [isWorkdayActive]);


  // --- UI Handlers ---
  const handleToggleWorkday = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para registrar tu jornada.");
      return;
    }

    const willBeActive = !isWorkdayActive;
    setIsWorkdayActive(willBeActive);

    try {
      if (willBeActive) {
        const workday = await startWorkday(user.uid);
        setActiveWorkday(workday);
        // Load existing time from server if any
        setDrivingTime(workday.totalDrivingTimeSeconds || 0);
        if (!isMovingRef.current) {
          toast.info("Jornada iniciada. El contador avanzará cuando el vehículo se mueva.");
        }
      } else if (activeWorkday) {
        await logWorkdayEvent(user.uid, activeWorkday.id, 'WORKDAY_END');
        // Final update before closing
        await updateWorkdayTimes(user.uid, activeWorkday.id, { drivingTime });
        setDrivingTime(0);
        setActiveWorkday(null);
        toast.success("Jornada finalizada.");
      }
    } catch (error) {
      console.error("Error al cambiar el estado de la jornada:", error);
      toast.error("No se pudo actualizar el estado de la jornada.");
      setIsWorkdayActive(!willBeActive); // Revert state on error
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registro de Jornada</CardTitle>
          <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>El tiempo se cuenta si la jornada está activa y la velocidad supera los 5 km/h.</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="text-6xl font-bold font-mono tracking-tighter">
          {formatTime(drivingTime)}
        </div>
        <div className="flex items-center gap-6">
          <Button onClick={handleToggleWorkday} size="lg" className="w-32" disabled={!user}>
            {isWorkdayActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isWorkdayActive ? 'Finalizar' : 'Iniciar'}
          </Button>
          <div className={`flex items-center gap-2 transition-opacity ${isMoving && isWorkdayActive ? 'opacity-100' : 'opacity-50'}`}>
            <MoveRight className={`transition-transform duration-500 ${isMoving && isWorkdayActive ? 'translate-x-1' : ''}`} />
            <span className="font-medium text-lg">
                {currentSpeed.toFixed(0)} km/h
            </span>
          </div>
        </div>
         {!user && <p className="text-xs text-muted-foreground mt-2">Inicia sesión para poder registrar tu jornada.</p>}
      </CardContent>
    </Card>
  );
}
