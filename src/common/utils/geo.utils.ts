export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get bounding box coordinates for proximity search
 */
export function getBoundingBox(
  center: Coordinates,
  radiusKm: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const R = 6371; // Earth's radius in kilometers
  
  const latChange = (radiusKm / R) * (180 / Math.PI);
  const lngChange =
    ((radiusKm / R) * (180 / Math.PI)) /
    Math.cos((center.latitude * Math.PI) / 180);
  
  return {
    minLat: center.latitude - latChange,
    maxLat: center.latitude + latChange,
    minLng: center.longitude - lngChange,
    maxLng: center.longitude + lngChange,
  };
}

/**
 * Nigerian states with their approximate center coordinates
 */
export const NIGERIA_STATE_COORDINATES: Record<string, Coordinates> = {
  'Lagos': { latitude: 6.5244, longitude: 3.3792 },
  'Abuja': { latitude: 9.0579, longitude: 7.4951 },
  'Kano': { latitude: 12.0022, longitude: 8.5920 },
  'Rivers': { latitude: 4.8156, longitude: 7.0498 },
  'Oyo': { latitude: 7.8500, longitude: 3.9333 },
  'Kaduna': { latitude: 10.5167, longitude: 7.4333 },
  'Ogun': { latitude: 7.1608, longitude: 3.3489 },
  'Anambra': { latitude: 6.2209, longitude: 7.0670 },
  'Enugu': { latitude: 6.4584, longitude: 7.5464 },
  'Delta': { latitude: 5.8904, longitude: 5.6800 },
  'Edo': { latitude: 6.5438, longitude: 5.8987 },
  'Imo': { latitude: 5.4920, longitude: 7.0261 },
  'Kwara': { latitude: 8.4799, longitude: 4.5418 },
  'Osun': { latitude: 7.5629, longitude: 4.5200 },
  'Ondo': { latitude: 7.2500, longitude: 5.2000 },
  'Abia': { latitude: 5.4527, longitude: 7.5248 },
  'Cross River': { latitude: 5.8702, longitude: 8.5988 },
  'Akwa Ibom': { latitude: 5.0073, longitude: 7.8493 },
  'Plateau': { latitude: 9.2182, longitude: 9.5179 },
  'Borno': { latitude: 11.8333, longitude: 13.1500 },
  'Bauchi': { latitude: 10.3158, longitude: 9.8442 },
  'Sokoto': { latitude: 13.0533, longitude: 5.2476 },
  'Niger': { latitude: 9.9309, longitude: 5.5983 },
  'Kogi': { latitude: 7.7969, longitude: 6.7406 },
  'Nassarawa': { latitude: 8.5380, longitude: 8.3227 },
  'Benue': { latitude: 7.3369, longitude: 8.7404 },
  'Taraba': { latitude: 7.9994, longitude: 10.7740 },
  'Adamawa': { latitude: 9.3265, longitude: 12.3984 },
  'Gombe': { latitude: 10.2897, longitude: 11.1673 },
  'Yobe': { latitude: 12.2939, longitude: 11.4390 },
  'Jigawa': { latitude: 12.2280, longitude: 9.5616 },
  'Kebbi': { latitude: 12.4539, longitude: 4.1975 },
  'Zamfara': { latitude: 12.1844, longitude: 6.2499 },
  'Katsina': { latitude: 13.0059, longitude: 7.6000 },
  'Ekiti': { latitude: 7.6210, longitude: 5.2210 },
  'Bayelsa': { latitude: 4.7719, longitude: 6.0699 },
  'Ebonyi': { latitude: 6.2649, longitude: 8.0137 },
};