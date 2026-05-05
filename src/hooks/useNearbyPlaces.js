import { useState, useEffect } from 'react';
import { fetchNearbyPlaces, fetchCityName, calculateDistance } from '../utils/nearbyPlaces';

export const useNearbyPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Get city name
        const city = await fetchCityName(latitude, longitude);
        setCityName(city);

        // Get nearby places
        try {
          const raw = await fetchNearbyPlaces(latitude, longitude);

          // Add distance + sort + take top 8
          const withDistance = raw
            .map((p) => ({
              ...p,
              distance: calculateDistance(latitude, longitude, p.lat, p.lng),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 8);

          setPlaces(withDistance);
        } catch (err) {
          console.error('Nearby places error:', err);
          setError('Could not fetch nearby places.');
        }

        setLoading(false);
      },
      () => {
        setError('Location access denied. Enable location to see nearby wonders.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000 }
    );
  }, []);

  return { places, loading, cityName, error };
};
