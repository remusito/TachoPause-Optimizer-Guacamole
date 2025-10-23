'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Client, Place, PlaceType2 } from '@googlemaps/google-maps-services-js';
import { decode } from '@googlemaps/polyline-codec';

const FindServiceAreasInputSchema = z.object({
  currentLocation: z.string(),
  destination: z.string(),
});
export type FindServiceAreasInput = z.infer<typeof FindServiceAreasInputSchema>;

const FindServiceAreasOutputSchema = z.object({
  routeSummary: z.string(),
  serviceAreas: z.array(
    z.object({
      name: z.string(),
      location: z.string(),
      services: z.array(z.string()),
      distance: z.string(),
      mapsUrl: z.string(),
    })
  ),
});
export type FindServiceAreasOutput = z.infer<typeof FindServiceAreasOutputSchema>;

export async function findServiceAreas(input: FindServiceAreasInput): Promise<FindServiceAreasOutput> {
  return findServiceAreasFlow(input);
}

const findServiceAreasFlow = ai.defineFlow(
  {
    name: 'findServiceAreasFlow',
    inputSchema: FindServiceAreasInputSchema,
    outputSchema: FindServiceAreasOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Google Maps API key is missing.");

    const client = new Client({});

    try {
      // 1️⃣ Obtener la ruta completa
      const directionsResponse = await client.directions({
        params: {
          origin: input.currentLocation,
          destination: input.destination,
          key: apiKey,
        },
      });

      if (!directionsResponse.data.routes.length) {
        return { routeSummary: 'No se encontró ruta.', serviceAreas: [] };
      }

      const route = directionsResponse.data.routes[0];
      const decodedPath = decode(route.overview_polyline.points);

      // 2️⃣ Submuestrear la ruta (~1 km entre puntos)
      const minDistanceBetweenPoints = 0.01; // ~1 km en grados
      let lastPoint = decodedPath[0];
      const samplePoints = [lastPoint];

      for (const point of decodedPath) {
        const latDiff = Math.abs(point[0] - lastPoint[0]);
        const lngDiff = Math.abs(point[1] - lastPoint[1]);
        if (latDiff > minDistanceBetweenPoints || lngDiff > minDistanceBetweenPoints) {
          samplePoints.push(point);
          lastPoint = point;
        }
      }

      // 3️⃣ Buscar áreas a lo largo de la ruta
      const searchRadius = 2000; // 2 km
      let allPlaces: Place[] = [];

      for (const p of samplePoints) {
        const placeResp = await client.placesNearby({
          params: {
            location: { lat: p[0], lng: p[1] },
            radius: searchRadius,
            type: 'rest_area' as PlaceType2,
            keyword: 'truck stop, area de servicio',
            key: apiKey,
          },
        });
        allPlaces = allPlaces.concat(placeResp.data.results);
      }

      // 4️⃣ Eliminar duplicados
      const uniquePlacesMap = new Map<string, Place>();
      allPlaces.forEach(p => p.place_id && uniquePlacesMap.set(p.place_id, p));
      const uniquePlaces = Array.from(uniquePlacesMap.values());

      // 5️⃣ Filtrar solo las áreas en sentido correcto de la ruta
      const filteredPlaces: Place[] = [];
      for (const place of uniquePlaces) {
        if (!place.geometry || !place.geometry.location) continue;

        const nearestIndex = decodedPath.reduce((closestIdx, pt, idx) => {
          const d = Math.hypot(pt[0] - place.geometry!.location.lat, pt[1] - place.geometry!.location.lng);
          const closestD = Math.hypot(
            decodedPath[closestIdx][0] - place.geometry!.location.lat,
            decodedPath[closestIdx][1] - place.geometry!.location.lng
          );
          return d < closestD ? idx : closestIdx;
        }, 0);

        // solo aceptamos si el área está “adelante” en la ruta
        if (nearestIndex >= 0) {
          filteredPlaces.push(place);
        }
      }

      // 6️⃣ Calcular distancia desde el origen
      const serviceAreaPromises = filteredPlaces.map(async (place: Place) => {
        let distanceText = 'N/A';
        if (place.geometry && place.geometry.location) {
          const distResp = await client.directions({
            params: {
              origin: input.currentLocation,
              destination: `place_id:${place.place_id}`,
              key: apiKey,
            },
          });

          if (distResp.data.routes.length && distResp.data.routes[0].legs.length) {
            distanceText = distResp.data.routes[0].legs[0].distance?.text ?? 'N/A';
          }
        }

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || '')}&query_place_id=${place.place_id}`;

        return {
          name: place.name || 'Sin nombre',
          location: place.vicinity || 'Ubicación no disponible',
          services: place.types || [],
          distance: distanceText,
          mapsUrl,
        };
      });

      const serviceAreas = await Promise.all(serviceAreaPromises);

return {
  routeSummary: `Mostrando hasta 20 áreas de servicio en el sentido de la ruta de ${input.currentLocation} a ${input.destination}.`,
  serviceAreas: serviceAreas.slice(0, 20),
};


    } catch (e: any) {
      console.error('Google Maps API error:', e.response?.data?.error_message || e.message);
      throw new Error(`Error al consultar Google Maps: ${e.response?.data?.error_message || e.message}`);
    }
  }
);
