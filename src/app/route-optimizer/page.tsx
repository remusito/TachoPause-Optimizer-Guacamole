'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  InfoWindow,
} from '@react-google-maps/api';
import { FaMapMarkerAlt, FaPlus, FaTrash, FaRoute } from 'react-icons/fa';
import { useAuth } from '@/firebase/auth/provider';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Estilos y opciones del mapa
const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
};

// Componente principal
export default function RouteOptimizerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);

  // Hook de carga de la API de Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'directions', 'geocoding'],
  });

  const [stops, setStops] = useState(['', '']);
  const [center, setCenter] = useState({ lat: 40.416775, lng: -3.70379 });
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [infoWindow, setInfoWindow] = useState<{ position: { lat: number; lng: number; }; content: string; } | null>(null);

  const autocompleteRefs = useRef<(google.maps.places.Autocomplete | null)[]>([]);

  // Efecto para verificar el estado premium del usuario
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      const checkPremium = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().isPremium) {
          setIsPremium(true);
        } else {
          router.push('/dashboard');
        }
      };
      checkPremium();
    }
  }, [user, loading, router]);

  const addStop = () => {
    if (stops.length < 10) { // Limitar a 10 paradas por ahora
      setStops([...stops, '']);
    }
  };

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
    autocompleteRefs.current.splice(index, 1);
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete, index: number) => {
    autocompleteRefs.current[index] = autocomplete;
  };

  const onPlaceChanged = (index: number) => {
    const autocomplete = autocompleteRefs.current[index];
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const newStops = [...stops];
      newStops[index] = place.formatted_address || place.name || '';
      setStops(newStops);
    } else {
      console.error('Autocomplete is not loaded yet!');
    }
  };
  
  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const calculateRoute = async () => {
    const validStops = stops.filter(stop => stop.trim() !== '');
    if (validStops.length < 2) {
      alert('Por favor, introduce al menos un origen y un destino.');
      return;
    }

    setIsCalculating(true);
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');

    try {
      const directionsService = new google.maps.DirectionsService();
      const origin = validStops[0];
      const destination = validStops[validStops.length - 1];
      const waypoints = validStops.slice(1, -1).map(stop => ({
        location: stop,
        stopover: true,
      }));

      const results = await directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);
      let totalDistance = 0;
      let totalDuration = 0;
      results.routes[0].legs.forEach(leg => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });
      setDistance(`${(totalDistance / 1000).toFixed(2)} km`);
      // Velocidad media de camión: 80 km/h. Factor de corrección: 1.15 para incluir tráfico/paradas
      const estimatedTruckDuration = (totalDistance / 1000) / 80 * 1.15;
      const hours = Math.floor(estimatedTruckDuration);
      const minutes = Math.round((estimatedTruckDuration - hours) * 60);
      setDuration(`~ ${hours}h ${minutes}m (a 80 km/h)`);

    } catch (error) {
      console.error('Error calculating directions:', error);
      alert('No se pudo calcular la ruta. Asegúrate de que las direcciones sean válidas.');
    } finally {
      setIsCalculating(false);
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setInfoWindow({
            position: { lat, lng },
            content: results[0].formatted_address
          });
        } else {
           setInfoWindow({
            position: { lat, lng },
            content: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
          });
        }
      });
    }
  }, []);

  if (loading || !isPremium) {
    return <div className="flex justify-center items-center h-screen"><span className="loader"></span></div>;
  }

  if (loadError) {
    return <div>Error al cargar Google Maps. Comprueba la clave de la API.</div>;
  }

  return isLoaded ? (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-1/3 p-4 overflow-y-auto flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-green-400">Optimizador de Ruta</h1>
        
        {stops.map((stop, index) => (
          <div key={index} className="flex items-center mb-2">
            <FaMapMarkerAlt className={`mr-2 ${index === 0 ? 'text-green-500' : index === stops.length - 1 ? 'text-red-500' : 'text-blue-500'}`} />
            <div className="flex-grow">
               <Autocomplete
                onLoad={(autocomplete) => onAutocompleteLoad(autocomplete, index)}
                onPlaceChanged={() => onPlaceChanged(index)}
              >
                <input
                  type="text"
                  placeholder={index === 0 ? 'Origen' : index === stops.length - 1 ? 'Destino' : `Parada ${index}`}
                  value={stop}
                  onChange={(e) => handleStopChange(index, e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </Autocomplete>
            </div>
            {stops.length > 2 && (
              <button onClick={() => removeStop(index)} className="ml-2 text-red-500 hover:text-red-400">
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        
        <button onClick={addStop} className="flex items-center justify-center mt-2 p-2 bg-blue-600 hover:bg-blue-500 rounded w-full">
          <FaPlus className="mr-2" /> Añadir Parada
        </button>
        
        <button onClick={calculateRoute} disabled={isCalculating} className="flex items-center justify-center mt-4 p-2 bg-green-600 hover:bg-green-500 rounded w-full disabled:bg-gray-500">
          <FaRoute className="mr-2" /> {isCalculating ? 'Calculando...' : 'Calcular Ruta'}
        </button>

        {directionsResponse && (
          <div className="mt-4 p-4 bg-gray-800 rounded">
            <h2 className="text-lg font-bold">Resultados:</h2>
            <p><strong>Distancia:</strong> {distance}</p>
            <p><strong>Tiempo estimado (camión):</strong> {duration}</p>
          </div>
        )}
      </div>
      
      <div className="w-2/3 h-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={6}
          options={mapOptions}
          onClick={onMapClick}
        >
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
           {infoWindow && (
            <InfoWindow
              position={infoWindow.position}
              onCloseClick={() => setInfoWindow(null)}
            >
              <div>{infoWindow.content}</div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  ) : (
     <div className="flex justify-center items-center h-screen"><span className="loader"></span></div>
  );
}
