'''
      import { NextResponse } from 'next/server';
      import { Loader } from '@googlemaps/js-api-loader';
      
      export async function POST(req: Request) {
        try {
          const { lat, lng } = await req.json();
      
          // Validar entrada
          if (!lat || !lng) {
           return NextResponse.json({ error: 'Faltan latitud o longitud' }, { status: 400 });
         }
     
         // Inicializar Google Maps API
         const loader = new Loader({
           apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
           version: 'weekly',
           libraries: ['geocoding'],
         });
     
         const google = await loader.load();
         const geocoder = new google.maps.Geocoder();
     
         // Hacer geocodificación inversa
         const response = await geocoder.geocode({ location: { lat, lng } });
     
         if (!response.results || response.results.length === 0) {
           return NextResponse.json({ error: 'No se encontraron resultados' }, { status: 404 });
         }
     
         const result = response.results[0];
         let city = '';
         let country = '';
'''