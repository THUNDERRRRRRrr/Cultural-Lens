/**
 * Fetch nearby cultural places from OpenStreetMap Overpass API via proxy.
 */
export async function fetchNearbyPlaces(lat, lng) {
  try {
    const query = `[out:json][timeout:10];
    (
      node["tourism"~"museum|attraction|artwork|monument|gallery"](around:3000,${lat},${lng});
      node["historic"~"monument|memorial|ruins|castle|building"](around:3000,${lat},${lng});
      node["amenity"~"place_of_worship"](around:3000,${lat},${lng});
    );
    out 12;`;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(overpassUrl)}`;

    const response = await fetch(proxyUrl);
    const wrapper = await response.json();
    const data = JSON.parse(wrapper.contents);

    if (!data || !Array.isArray(data.elements)) return [];

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
  } catch (err) {
    console.error('fetchNearbyPlaces failed:', err);
    return [];
  }
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

export async function fetchCityName(lat, lng) {
  try {
    const nominatimUrl = 
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const proxyUrl = 
      `https://api.allorigins.win/get?url=${encodeURIComponent(nominatimUrl)}`;
    const res = await fetch(proxyUrl);
    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);
    return data.address?.city || data.address?.town || 
           data.address?.village || data.address?.county || '';
  } catch { return ''; }
}

export async function searchCities(query) {
  if (!query || query.length < 2) return [];
  try {
    const nominatimUrl = 
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    const proxyUrl = 
      `https://api.allorigins.win/get?url=${encodeURIComponent(nominatimUrl)}`;
    const res = await fetch(proxyUrl);
    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);
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
    const wikiUrl = 
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;
    const proxyUrl = 
      `https://api.allorigins.win/get?url=${encodeURIComponent(wikiUrl)}`;
    const res = await fetch(proxyUrl);
    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);
    return data.thumbnail?.source ?? null;
  } catch { return null; }
}
