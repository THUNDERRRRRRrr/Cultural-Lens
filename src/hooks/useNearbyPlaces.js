import { useState, useEffect } from 'react';
import { fetchNearbyPlaces } from '../utils/nearbyPlaces';

/**
 * Fetches nearby cultural places for a given {lat, lng} location.
 * Re-fetches whenever location changes.
 */
export const useNearbyPlaces = (location) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
     
    setError(null);
     
    setPlaces([]);

    (async () => {
      try {
        const raw = await fetchNearbyPlaces(location.lat, location.lng);
        if (cancelled) return;
        setPlaces(raw.slice(0, 8));
      } catch (err) {
        if (!cancelled) {
          console.error('Nearby places error:', err);
          setError('Could not fetch nearby places.');
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [location]);

  return { places, loading, error };
};
