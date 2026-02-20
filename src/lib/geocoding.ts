/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 * Privacy: Returns city/POI centroids, not exact addresses
 */
import { appName } from "@/config/app";

export interface PlaceSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
  };
}

export interface CoarsenedPlace {
  lat: number;
  lng: number;
  label: string;
}

/**
 * Search for cities and POIs using Nominatim
 * @param query - Search query (e.g., "Milan", "Paris", "Central Park")
 */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (!query.trim()) return [];

  try {
    // Use Nominatim API to search for places
    // Limit to cities, towns, villages, and notable POIs
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '8',
      addressdetails: '1',
      // Prefer populated places and landmarks
      'accept-language': 'en',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': `${appName.replace(/\s+/g, '')}/1.0`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place suggestions');
    }

    const data: PlaceSuggestion[] = await response.json();
    
    // Filter to only show cities, towns, and villages - exclude administrative boundaries
    return data
      .filter(place => {
        const type = place.type?.toLowerCase();
        
        // Only include actual populated places, not administrative boundaries
        return (
          type === 'city' ||
          type === 'town' ||
          type === 'village' ||
          type === 'municipality' ||
          type === 'suburb' ||
          // Only include administrative if it has a city/town in address (actual city boundaries)
          (type === 'administrative' && (place.address?.city || place.address?.town))
        );
      })
      .sort((a, b) => {
        // Prioritize city/town over other types
        const aType = a.type?.toLowerCase();
        const bType = b.type?.toLowerCase();
        
        const aPriority = (aType === 'city' || aType === 'town') ? 1 : 2;
        const bPriority = (bType === 'city' || bType === 'town') ? 1 : 2;
        
        return aPriority - bPriority;
      });
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

/**
 * Coarsen coordinates to city-level precision (~3 decimal places ≈ 111m)
 * Privacy requirement: Do not store exact coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @param label - City/POI name
 */
export function coarsenPlace(
  lat: number,
  lng: number,
  label: string
): CoarsenedPlace {
  // Round to 3 decimal places (≈111m precision)
  // This provides good city-center accuracy while maintaining privacy
  const coarsenedLat = Math.round(lat * 1000) / 1000;
  const coarsenedLng = Math.round(lng * 1000) / 1000;

  return {
    lat: coarsenedLat,
    lng: coarsenedLng,
    label: label.trim(),
  };
}

/**
 * Format a place suggestion into a readable label
 */
export function formatPlaceLabel(place: PlaceSuggestion): string {
  const city =
    place.address?.city ||
    place.address?.town ||
    place.address?.village ||
    place.display_name.split(',')[0];
  
  const country = place.address?.country_code?.toUpperCase() || '';
  
  return country ? `${city}, ${country}` : city;
}
