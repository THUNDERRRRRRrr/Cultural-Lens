import { useState, useEffect } from 'react';
import { fetchNearbyPlaces } from '../utils/nearbyPlaces';

export const useNearbyPlaces = (location) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lat = location?.lat;
  const lng = location?.lng;

  useEffect(() => {
    if (!lat || !lng) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlaces([]);

    (async () => {
      try {
        const raw = await fetchNearbyPlaces(lat, lng);
        if (!cancelled) setPlaces(raw.slice(0, 8));
      } catch (err) {
        if (!cancelled) {
          console.error('Nearby places error:', err);
          setError('Could not fetch nearby places.');
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [lat, lng]);

  return { places, loading, error };
};
