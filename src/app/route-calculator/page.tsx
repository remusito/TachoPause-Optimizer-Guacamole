'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { PremiumPlaceholder } from '../components/premium-placeholder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Trash2, Navigation } from 'lucide-react';

type RouteSegment = {
  id: number;
  origin: string;
  destination: string;
};

export default function RouteCalculatorPage() {
  const [segments, setSegments] = useState<RouteSegment[]>([{ id: 1, origin: '', destination: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSegmentChange = (id: number, field: 'origin' | 'destination', value: string) => {
    setSegments(segments.map(seg => seg.id === id ? { ...seg, [field]: value } : seg));
  };

  const handleUseCurrentLocation = async (segmentId: number) => {
    if (!navigator.geolocation) {
      toast({
        title: 'No disponible',
        description: 'Tu navegador no soporta geolocalización.',
        variant: 'destructive',
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch('/api/reverse-geocode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ latitude, longitude }),
          });

          if (!response.ok) {
            throw new Error('No se pudo obtener la dirección');
          }

          const data = await response.json();
          
          setSegments(segments.map(seg => 
            seg.id === segmentId 
              ? { ...seg, origin: data.address } 
              : seg
          ));

          toast({
            title: '📍 Ubicación obtenida',
            description: `Tu ubicación: ${data.address}`,
          });
        } catch (error) {
          console.error('Error getting address:', error);
          
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setSegments(segments.map(seg => 
            seg.id === segmentId 
              ? { ...seg, origin: locationString } 
              : seg
          ));
          
          toast({
            title: '📍 Ubicación obtenida',
            description: 'Se usaron las coordenadas (no se pudo obtener la dirección).',
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        
        let errorMessage = 'No se pudo obtener tu ubicación.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Debes permitir el acceso a tu ubicación en el navegador.';
        }
        
        toast({
          title: 'Error de ubicación',
          description: errorMessage,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const addSegment = () => {
    if (segments.length < 6) {
      setSegments([...segments, { id: Date.now(), origin: '', destination: '' }]);
    } else {
      toast({
        title: 'Límite alcanzado',
        description: 'Puedes añadir un máximo de 6 tramos.',
      });
    }
  };

  const removeSegment = (id: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter(seg => seg.id !== id));
    }
  };

  const handleCalculate = async () => {
    const routeDetails = segments.map(s => ({
      origin: s.origin.trim(), 
      destination: s.destination.trim()
    }));

    if (routeDetails.some(route => !route.origin || !route.destination)) {
      toast({
        title: 'Faltan datos',
        description: 'Por favor, completa todos los campos de origen y destino.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔵 Calculando ruta con:', routeDetails);
      
      const response = await fetch('/api/calculate-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeDetails }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al calcular la ruta');
      }

      const data = await response.json();
      console.log('✅ Resultado:', data);
      setResult(data);
      toast({
        title: 'Ruta calculada',
        description: 'La ruta se ha calculado correctamente.',
      });
    } catch (e) {
      console.error('❌ Error calculando ruta:', e);
      const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
      setError(errorMessage);
      toast({
        title: 'Error de Cálculo',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="w-full p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Calculator className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            Calculadora de Ruta
          </h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center w-full p-4 sm:p-6 gap-6">
        <PremiumPlaceholder
          title="Calculadora de Ruta para Camión"
          description="Estima la distancia y el tiempo de tu viaje a una velocidad media de 70 km/h."
        >
          <div className="w-full max-w-md space-y-6">
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Resultado Total de la Ruta</CardTitle>
                  <CardDescription>
                    Resumen completo de todos los tramos introducidos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <Icons.Milestone className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Distancia Total</p>
                    <p className="text-xl font-bold">{result.totalDistance}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <Icons.Timer className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Tiempo Total Estimado</p>
                    <p className="text-xl font-bold">{result.totalDuration}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Calcular Ruta por Tramos</CardTitle>
                <CardDescription>
                  Introduce los tramos de tu ruta. Se calculará la distancia y tiempo para cada uno y se mostrará el total.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {segments.map((segment, index) => (
                  <div key={segment.id} className="p-4 border rounded-lg space-y-4 bg-muted/50 relative">
                    <Label className="font-semibold">Tramo {index + 1}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`origin-${segment.id}`}>Origen</Label>
                        <div className="flex gap-2">
                          <Input 
                            id={`origin-${segment.id}`} 
                            placeholder="Ej: Barcelona, España" 
                            value={segment.origin} 
                            onChange={(e) => handleSegmentChange(segment.id, 'origin', e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleUseCurrentLocation(segment.id)}
                            disabled={isLoading || isGettingLocation}
                            title="Usar mi ubicación actual"
                          >
                            {isGettingLocation ? (
                              <Icons.spinner className="h-4 w-4 animate-spin" />
                            ) : (
                              <Navigation className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`destination-${segment.id}`}>Destino</Label>
                        <Input 
                          id={`destination-${segment.id}`} 
                          placeholder="Ej: Lyon, Francia" 
                          value={segment.destination} 
                          onChange={(e) => handleSegmentChange(segment.id, 'destination', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    {segments.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-7 w-7" 
                        onClick={() => removeSegment(segment.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Eliminar tramo</span>
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex justify-start">
                  <Button 
                    variant="outline" 
                    onClick={addSegment} 
                    disabled={segments.length >= 6 || isLoading}
                  >
                    <Icons.Play className="mr-2 rotate-90 h-4 w-4" /> Añadir Tramo
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCalculate} disabled={isLoading} className="w-full">
                  {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Calculator className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Calculando...' : 'Calcular Ruta Completa'}
                </Button>
              </CardFooter>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </PremiumPlaceholder>
      </main>
    </div>
  );
}
