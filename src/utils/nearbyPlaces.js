/**
 * Fetch nearby cultural places from OpenStreetMap Overpass API.
 * Free, no API key needed.
 */
export async function fetchNearbyPlaces(lat, lng) {
  const query = `
    [out:json][timeout:10];
    (
      node["tourism"~"museum|attraction|artwork|monument|gallery"](around:3000,${lat},${lng});
      node["historic"~"monument|memorial|ruins|castle|building"](around:3000,${lat},${lng});
      node["amenity"~"place_of_worship"](around:3000,${lat},${lng});
    );
    out 12;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  const data = await response.json();

  return data.elements
    .filter((el) => el.tags?.name)
    .map((el) => ({
      id: el.id,
      name: el.tags.name,
      lat: el.lat,
      lng: el.lon,
      type: getPlaceType(el.tags),
      typeIcon: getPlaceTypeIcon(el.tags),
    }));
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

/**
 * Fetch a place photo from Wikimedia / Wikipedia REST API.
 * Free, no API key needed.
 * @param {string} placeName
 * @returns {Promise<string|null>} thumbnail URL or null
 */
export async function fetchPlacePhoto(placeName) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/**
 * Get city name from coordinates via Nominatim reverse geocoding.
 * Free, no API key needed.
 */
export async function fetchCityName(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'CulturalLens/1.0' } }
    );
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      ''
    );
  } catch {
    return '';
  }
}


/**
 * Search cities via Nominatim (free, no key).
 * @param {string} query
 * @returns {Promise<Array<{name: string, displayName: string, lat: number, lng: number}>>}
 */
export async function searchCities(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      { headers: { 'User-Agent': 'CulturalLens/1.0' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item) => ({
      name: item.address?.city || item.address?.town || item.address?.village || item.name || query,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
}
