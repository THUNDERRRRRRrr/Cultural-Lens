import { useState, useEffect, useCallback } from 'react';
import { fetchCityName } from '../utils/nearbyPlaces';

/**
 * Manages location state — auto-detects GPS on mount, supports manual override.
 */
export function useLocation() {
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('Detecting…');
  const [isManual, setIsManual] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [detecting, setDetecting] = useState(true);

  // Auto-detect on mount (or when reset to GPS)
  useEffect(() => {
    if (isManual) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetecting(true);
     
    setGpsError(null);

    if (!navigator.geolocation) {
      // Fallback to New Delhi
      setLocation({ lat: 28.6139, lng: 77.2090 });
      setCityName('New Delhi');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        const city = await fetchCityName(lat, lng);
        setCityName(city || 'Unknown');
        setDetecting(false);
      },
      () => {
        // GPS denied — default to New Delhi
        setGpsError('Location access denied.');
        setLocation({ lat: 28.6139, lng: 77.2090 });
        setCityName('New Delhi');
        setDetecting(false);
      },
      { enableHighAccuracy: false, timeout: 15000 }
    );
  }, [isManual]);

  const setManualLocation = useCallback((city) => {
    setLocation({ lat: city.lat, lng: city.lng });
    setCityName(city.name);
    setIsManual(true);
    setGpsError(null);
  }, []);

  const resetToGPS = useCallback(() => {
    setIsManual(false);
  }, []);

  return { location, cityName, detecting, isManual, gpsError, setManualLocation, resetToGPS };
}
