export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  const query = `[out:json][timeout:15];(node["tourism"~"museum|attraction|artwork|monument|gallery"](around:3000,${lat},${lng});node["historic"~"monument|memorial|ruins|castle|building"](around:3000,${lat},${lng});node["amenity"~"place_of_worship"](around:3000,${lat},${lng}););out 12;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CulturalLens/1.0'
      }
    });
    if (!response.ok) {
      throw new Error(`Overpass returned HTTP ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
