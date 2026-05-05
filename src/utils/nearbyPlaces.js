import { getPlacesForCity } from '../data/cityPlaces';

export async function fetchNearbyPlaces(lat, lng, cityName) {
  // Tier 1: Check curated database (instant, no network)
  const curated = getPlacesForCity(cityName);
  if (curated) {
    return curated.map((place, index) => ({
      id: `${place.name.replace(/\s+/g, '-').toLowerCase()}-${index}`,
      name: place.name,
      lat: lat,
      lng: lng,
      type: place.type,
      typeIcon: place.typeIcon,
    }));
  }

  // Tier 2: Unknown city — discover places live from OpenStreetMap
  try {
    const response = await fetch(`/api/nearby?lat=${lat}&lng=${lng}`);
    if (!response.ok) {
      console.error('Nearby API error:', response.status);
      return [];
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.elements)) {
      console.error('Unexpected Overpass response:', data);
      return [];
    }
    return data.elements
      .filter((el) => el.tags?.name)
      .slice(0, 12)
      .map((el) => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        type: getPlaceType(el.tags),
        typeIcon: getPlaceTypeIcon(el.tags),
      }));
  } catch (err) {
    console.error('fetchNearbyPlaces fallback failed:', err);
    return [];
  }
}

export async function fetchCityName(lat, lng) {
  try {
    const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.address?.city || data.address?.town ||
           data.address?.village || data.address?.county || '';
  } catch { return ''; }
}

export async function searchCities(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item) => ({
      name: item.address?.city || item.address?.town ||
            item.address?.village || item.name || query,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch { return []; }
}

export async function fetchPlacePhoto(placeName) {
  try {
    const res = await fetch(
      `/api/photo?name=${encodeURIComponent(placeName)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source ?? null;
  } catch { return null; }
}

function getPlaceType(tags) {
  if (tags.tourism === 'museum') return 'museum';
  if (tags.tourism === 'gallery') return 'gallery';
  if (tags.amenity === 'place_of_worship') {
    if (tags.religion === 'muslim' || tags.religion === 'islam') return 'mosque';
    if (tags.religion === 'christian') return 'church';
    return 'temple';
  }
  if (tags.historic) return 'monument';
  return 'attraction';
}

function getPlaceTypeIcon(tags) {
  if (tags.tourism === 'museum') return '🏛️';
  if (tags.tourism === 'gallery' || tags.tourism === 'artwork') return '🎨';
  if (tags.historic === 'castle') return '🏰';
  if (tags.historic) return '🏰';
  if (tags.amenity === 'place_of_worship') {
    if (tags.religion === 'muslim' || tags.religion === 'islam') return '🕌';
    if (tags.religion === 'christian') return '⛪';
    if (tags.religion === 'hindu') return '🛕';
    return '⛪';
  }
  return '🏛️';
}
