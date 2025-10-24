import { NextResponse } from 'next/server';
import { Loader } from '@googlemaps/js-api-loader';

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();

    // Validar entrada
    if (lat === undefined || lng === undefined) {
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
      return NextResponse.json({ error: 'No se encontraron resultados para las coordenadas proporcionadas' }, { status: 404 });
    }

    const result = response.results[0];
    let city = '';
    let country = '';

    // Extraer ciudad y país de los resultados
    for (const component of result.address_components) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
    }
    
    // Si no se encuentra la localidad, buscar un nivel administrativo más amplio
    if (!city) {
        for (const component of result.address_components) {
            if (component.types.includes('administrative_area_level_2')) {
                city = component.long_name;
                break;
            }
        }
    }


    return NextResponse.json({ city, country, fullAddress: result.formatted_address });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json({ error: 'Error en el servidor al realizar la geocodificación inversa' }, { status: 500 });
  }
}
