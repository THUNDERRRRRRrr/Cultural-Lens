export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      { headers: { 'User-Agent': 'CulturalLens/1.0' } }
    );
    if (!response.ok) return res.status(200).json({ thumbnail: null });
    const data = await response.json();
    return res.status(200).json({ thumbnail: data.thumbnail ?? null });
  } catch {
    return res.status(200).json({ thumbnail: null });
  }
}
