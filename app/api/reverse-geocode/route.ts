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
      apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
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

    // Procesar componentes de la dirección
    for (const component of result.address_components) {
      // Usar aserción de tipo para evitar error de TypeScript
      const types = component.types as string[];
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_2') && !city) {
        city = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }

    return NextResponse.json({
      city: city || 'Desconocido',
      country: country || 'Desconocido',
      formatted_address: result.formatted_address,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en geocodificación: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
