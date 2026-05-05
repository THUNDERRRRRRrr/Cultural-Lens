import { useState, useEffect } from 'react';
import { fetchNearbyPlaces } from '../utils/nearbyPlaces';

export const useNearbyPlaces = (location, cityName) => {
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
        const raw = await fetchNearbyPlaces(lat, lng, cityName);
        if (!cancelled) setPlaces(raw);
      } catch (err) {
        if (!cancelled) {
          console.error('Nearby places error:', err);
          setError('Could not load places.');
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [lat, lng, cityName]);

  return { places, loading, error };
};
