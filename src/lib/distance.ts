/**
 * Distance utilities using the Haversine formula
 * for computing great-circle distances between coordinates.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula.
 * 
 * @param point1 - First coordinate {lat, lng}
 * @param point2 - Second coordinate {lat, lng}
 * @returns Distance in kilometers
 */
export function haversineDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1 = toRadians(point1.lat);
  const lat2 = toRadians(point2.lat);
  const deltaLat = toRadians(point2.lat - point1.lat);
  const deltaLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display with appropriate precision
 * 
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string (e.g., "0.5 km", "12.3 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // For distances under 1 km, show one decimal place
    return `${distanceKm.toFixed(1)} km`;
  }
  // For distances >= 1 km, show one decimal place
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Calculate distance between two points, handling invalid inputs
 * 
 * @returns Distance in km, or null if coordinates are invalid
 */
export function safeDistance(
  origin: Coordinates | null | undefined,
  destination: Coordinates | null | undefined
): number | null {
  if (!origin || !destination) return null;
  if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) return null;
  
  return haversineDistance(origin, destination);
}

/**
 * Validate coordinates are within valid ranges
 */
function isValidCoordinate(coord: Coordinates): boolean {
  return (
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    coord.lat >= -90 && coord.lat <= 90 &&
    coord.lng >= -180 && coord.lng <= 180 &&
    !isNaN(coord.lat) &&
    !isNaN(coord.lng)
  );
}
