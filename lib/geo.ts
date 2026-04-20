/**
 * Lightweight city / country -> lat+lng lookup for the factory map view.
 *
 * Extend as needed. Keys are lowercased for forgiving matching.
 */

type Coord = { lat: number; lng: number };

const CITY_COORDS: Record<string, Coord> = {
  // Chinese manufacturing hubs
  'guangzhou': { lat: 23.1291, lng: 113.2644 },
  'shenzhen': { lat: 22.5431, lng: 114.0579 },
  'dongguan': { lat: 23.0208, lng: 113.7518 },
  'foshan': { lat: 23.0219, lng: 113.1214 },
  'yiwu': { lat: 29.3068, lng: 120.0743 },
  'ningbo': { lat: 29.8683, lng: 121.544 },
  'hangzhou': { lat: 30.2741, lng: 120.1551 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'qingdao': { lat: 36.0671, lng: 120.3826 },
  'xuchang': { lat: 34.0357, lng: 113.852 },
  'henan': { lat: 33.8818, lng: 113.614 },
  'xiamen': { lat: 24.4798, lng: 118.0819 },
  'fuzhou': { lat: 26.0745, lng: 119.2965 },
  'suzhou': { lat: 31.2983, lng: 120.5832 },
  'wenzhou': { lat: 27.9938, lng: 120.6992 },
  'tianjin': { lat: 39.3434, lng: 117.3616 },
  'nanjing': { lat: 32.0603, lng: 118.7969 },
  'wuhan': { lat: 30.5928, lng: 114.3055 },
  'chongqing': { lat: 29.4316, lng: 106.9123 },
  'chengdu': { lat: 30.5728, lng: 104.0668 },
  'zhengzhou': { lat: 34.7466, lng: 113.6253 },

  // India
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.385, lng: 78.4867 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'tiruppur': { lat: 11.1085, lng: 77.3411 },

  // Vietnam
  'ho chi minh city': { lat: 10.8231, lng: 106.6297 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'hanoi': { lat: 21.0278, lng: 105.8342 },
  'haiphong': { lat: 20.8449, lng: 106.6881 },

  // Bangladesh
  'dhaka': { lat: 23.8103, lng: 90.4125 },
  'chittagong': { lat: 22.3569, lng: 91.7832 },

  // Pakistan / Turkey / elsewhere
  'karachi': { lat: 24.8607, lng: 67.0011 },
  'lahore': { lat: 31.5204, lng: 74.3587 },
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'izmir': { lat: 38.4192, lng: 27.1287 },

  // Korea / Japan
  'seoul': { lat: 37.5665, lng: 126.978 },
  'busan': { lat: 35.1796, lng: 129.0756 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'osaka': { lat: 34.6937, lng: 135.5023 },

  // Americas
  'new york': { lat: 40.7128, lng: -74.006 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },

  // Europe
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'milan': { lat: 45.4642, lng: 9.19 },
  'berlin': { lat: 52.52, lng: 13.405 },
  'barcelona': { lat: 41.3851, lng: 2.1734 },
};

const COUNTRY_COORDS: Record<string, Coord> = {
  china: { lat: 34.7, lng: 103.5 },
  india: { lat: 22.5937, lng: 78.9629 },
  vietnam: { lat: 14.0583, lng: 108.2772 },
  bangladesh: { lat: 23.685, lng: 90.3563 },
  pakistan: { lat: 30.3753, lng: 69.3451 },
  indonesia: { lat: -0.7893, lng: 113.9213 },
  philippines: { lat: 12.8797, lng: 121.774 },
  thailand: { lat: 15.87, lng: 100.9925 },
  'south korea': { lat: 36.5, lng: 127.75 },
  korea: { lat: 36.5, lng: 127.75 },
  japan: { lat: 36.2048, lng: 138.2529 },
  turkey: { lat: 39.9334, lng: 32.8597 },
  italy: { lat: 41.8719, lng: 12.5674 },
  france: { lat: 46.6034, lng: 1.8883 },
  spain: { lat: 40.4637, lng: -3.7492 },
  germany: { lat: 51.1657, lng: 10.4515 },
  'united kingdom': { lat: 55.3781, lng: -3.436 },
  uk: { lat: 55.3781, lng: -3.436 },
  'united states': { lat: 37.0902, lng: -95.7129 },
  usa: { lat: 37.0902, lng: -95.7129 },
  us: { lat: 37.0902, lng: -95.7129 },
  mexico: { lat: 23.6345, lng: -102.5528 },
  brazil: { lat: -14.235, lng: -51.9253 },
  peru: { lat: -9.19, lng: -75.0152 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
};

/**
 * Find best-effort coordinates for a factory. Tries the city first, then the
 * country. Returns null if nothing matches.
 */
export function lookupCoords(
  city: string | null | undefined,
  country: string | null | undefined
): Coord | null {
  if (city) {
    const key = city.trim().toLowerCase();
    if (CITY_COORDS[key]) return CITY_COORDS[key];
  }
  if (country) {
    const key = country.trim().toLowerCase();
    if (COUNTRY_COORDS[key]) return COUNTRY_COORDS[key];
  }
  return null;
}
