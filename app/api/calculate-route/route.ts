import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const TRUCK_AVG_SPEED_KMH = 70;

export async function POST(request: NextRequest) {
  try {
    const { routeDetails } = await request.json();
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key is not configured' },
        { status: 500 }
      );
    }

    const client = new Client({});
    let totalDistanceKm = 0;
    let totalDurationMinutes = 0;
    const segments = [];

    for (const route of routeDetails) {
      const directionsResponse = await client.directions({
        params: {
          origin: route.origin,
          destination: route.destination,
          key: apiKey,
        },
      });

      if (directionsResponse.data.routes.length === 0) {
        return NextResponse.json(
          { error: `No route found between ${route.origin} and ${route.destination}` },
          { status: 404 }
        );
      }

      const leg = directionsResponse.data.routes[0].legs[0];
      const distanceMeters = leg.distance?.value || 0;
      const distanceKm = distanceMeters / 1000;
      const durationHours = distanceKm / TRUCK_AVG_SPEED_KMH;
      const durationMinutes = durationHours * 60;

      totalDistanceKm += distanceKm;
      totalDurationMinutes += durationMinutes;

      const hours = Math.floor(durationMinutes / 60);
      const minutes = Math.round(durationMinutes % 60);

      segments.push({
        distance: `${distanceKm.toFixed(0)} km`,
        duration: `${hours}h ${minutes}m`,
        distanceKm,
        durationMinutes,
      });
    }

    const totalHours = Math.floor(totalDurationMinutes / 60);
    const remainingMinutes = Math.round(totalDurationMinutes % 60);

    return NextResponse.json({
      totalDistance: `${totalDistanceKm.toFixed(0)} km`,
      totalDuration: `${totalHours}h ${remainingMinutes}m`,
      segments,
    });

  } catch (error: any) {
    console.error('Error calculating route:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to calculate route',
        details: error.response?.data?.error_message 
      },
      { status: 500 }
    );
  }
}
