'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MainSidebar } from '@/components/main-sidebar';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Correctly type the libraries array for the Google Maps API
type Library = "places" | "directions" | "drawing" | "geometry" | "localContext" | "visualization";
const libraries: Library[] = ['places', 'directions'];

export default function RouteOptimizerPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState<string[]>(['']);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const stopRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const addStop = () => {
    setStops([...stops, '']);
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const calculateRoute = async () => {
    if (!origin || !destination) {
        toast.warning('Por favor, introduce un origen y un destino.');
        return;
    }
    setIsLoading(true);
    toast.info('Calculando la ruta...');

    const directionsService = new google.maps.DirectionsService();
    const waypoints = stops
      .filter((stop) => stop.trim() !== '')
      .map((stop) => ({ location: stop, stopover: true }));

    try {
        const results = await directionsService.route({
            origin,
            destination,
            waypoints,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidTolls,
            avoidHighways,
        });
        setDirections(results);
        toast.success('Ruta calculada con éxito.');
    } catch (error) {
        console.error("Error calculating route:", error);
        toast.error('No se pudo calcular la ruta. Comprueba las ubicaciones.');
    } finally {
        setIsLoading(false);
    }
  };

  const clearRoute = () => {
    setOrigin('');
    setDestination('');
    setStops(['']);
    setDirections(null);
    setAvoidTolls(false);
    setAvoidHighways(false);
    if (originRef.current) originRef.current.value = '';
    if (destinationRef.current) destinationRef.current.value = '';
    stopRefs.current.forEach(ref => {
        if(ref) ref.value = '';
    });
    toast.info('Se ha limpiado el formulario.');
  };

  useEffect(() => {
    // Initialize autocomplete for origin, destination, and stops
    if (isLoaded) {
      const setupAutocomplete = (ref: React.RefObject<HTMLInputElement>, setter: (value: string) => void) => {
          if (ref.current) {
              const autocomplete = new google.maps.places.Autocomplete(ref.current, { types: ['geocode'] });
              autocomplete.addListener('place_changed', () => {
                  const place = autocomplete.getPlace();
                  setter(place.formatted_address || place.name || '');
              });
          }
      }
      setupAutocomplete(originRef, setOrigin);
      setupAutocomplete(destinationRef, setDestination);
      stops.forEach((_, index) => {
          if(stopRefs.current[index]) {
            const autocomplete = new google.maps.places.Autocomplete(stopRefs.current[index]!, { types: ['geocode'] });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                handleStopChange(index, place.formatted_address || place.name || '');
            });
          }
      });
    }
  }, [isLoaded, stops.length]); // Rerun when a new stop is added

  if (loadError) {
    return <div className="flex h-screen items-center justify-center">Error al cargar Google Maps. Comprueba la clave de la API.</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <MainSidebar />
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 lg:w-1/4 p-4 overflow-y-auto">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icons.Route className="h-6 w-6 text-primary" />
            Optimizar Ruta
          </h1>

          <div className="space-y-4">
            <div>
              <label>Origen</label>
              <Input ref={originRef} onChange={e => setOrigin(e.target.value)} placeholder="Lugar de partida" />
            </div>

            {stops.map((stop, index) => (
              <div key={index} className="relative">
                <label>Parada {index + 1}</label>
                <Input 
                  ref={el => stopRefs.current[index] = el}
                  onChange={e => handleStopChange(index, e.target.value)} 
                  placeholder="Añadir una parada"
                />
                <Button variant="ghost" size="sm" className="absolute right-1 top-6" onClick={() => removeStop(index)}>
                  <Icons.trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addStop}>
              <Icons.add className="mr-2 h-4 w-4" />
              Añadir Parada
            </Button>

            <div>
              <label>Destino</label>
              <Input ref={destinationRef} onChange={e => setDestination(e.target.value)} placeholder="Lugar de destino" />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="avoidTolls" checked={avoidTolls} onCheckedChange={(checked) => setAvoidTolls(Boolean(checked))} />
                <label htmlFor="avoidTolls">Evitar peajes</label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="avoidHighways" checked={avoidHighways} onCheckedChange={(checked) => setAvoidHighways(Boolean(checked))} />
                <label htmlFor="avoidHighways">Evitar autopistas</label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={calculateRoute} disabled={isLoading || !isLoaded} className="w-full">
                {isLoading ? <Icons.spinner className="animate-spin h-4 w-4 mr-2"/> : <Icons.Calculator className="h-4 w-4 mr-2"/>}
                Calcular
              </Button>
              <Button onClick={clearRoute} variant="secondary" disabled={isLoading} title="Limpiar formulario">
                <Icons.close className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {directions && (
              <Card className="mt-6">
                  <CardHeader>
                      <CardTitle>Resumen de la Ruta</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-2 text-sm">
                          <p><strong>Distancia total:</strong> {directions.routes[0].legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0) / 1000} km</p>
                          <p><strong>Duración total:</strong> {Math.round(directions.routes[0].legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0) / 60)} minutos</p>
                          <p className="text-xs text-muted-foreground pt-2">{directions.routes[0].summary}</p>
                          <p className="text-xs text-muted-foreground">El orden de las paradas puede haber sido optimizado.</p>
                      </div>
                  </CardContent>
              </Card>
          )}

        </div>

        <div className="flex-1 bg-muted/20 relative">
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"><Icons.spinner className="animate-spin h-8 w-8 text-primary" /></div>}
            {isLoaded && (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: 40.416775, lng: -3.703790 }} // Default center (Madrid)
                    zoom={6}
                    onLoad={setMap}
                    options={{ mapTypeControl: false, streetViewControl: false }}
                >
                    {directions && <DirectionsRenderer directions={directions} />}
                    {!directions && origin && <Marker position={{ lat: 0, lng: 0 }} />} 
                </GoogleMap>
            )}
             {!directions && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-muted-foreground bg-background/80 p-4 rounded-lg">
                    <Icons.Pause className="h-10 w-10 mx-auto mb-2" />
                    <p>Introduce las ubicaciones para ver la ruta en el mapa.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
