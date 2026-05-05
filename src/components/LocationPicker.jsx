import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, LocateFixed } from 'lucide-react';
import { searchCities } from '../utils/nearbyPlaces';

// ─── Popular Cities ──────────────────────────────────────────────────────────

const POPULAR_CITIES = [
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
];

// ═════════════════════════════════════════════════════════════════════════════

const LocationPicker = ({ isOpen, onClose, onSelectCity, onUseGPS }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsErr, setGpsErr] = useState(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
       
      setResults([]);
       
      setGpsErr(null);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
       
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchCities(query);
      setResults(res);
      setSearching(false);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelectResult = (city) => {
    onSelectCity({ name: city.name, lat: city.lat, lng: city.lng });
    onClose();
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGpsErr('Geolocation not supported.');
      return;
    }
    setGpsLoading(true);
    setGpsErr(null);
    navigator.geolocation.getCurrentPosition(
      () => {
        setGpsLoading(false);
        onUseGPS();
        onClose();
      },
      () => {
        setGpsLoading(false);
        setGpsErr('Location access denied. Try searching instead.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-bg-secondary border-t border-gold/20 rounded-t-[20px] max-h-[85vh] overflow-y-auto"
          >
            <div className="px-6 pb-8 pt-3">
              {/* Drag handle */}
              <div className="flex justify-center mb-5">
                <div className="w-10 h-[3px] bg-gold/30 rounded-full" />
              </div>

              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <span className="label-gold text-[13px]">Change Location</span>
                <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-2">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search any city…"
                  className="w-full pl-10 pr-4 py-3 bg-transparent border border-border-subtle text-text-primary text-sm font-sans placeholder:text-text-muted outline-none focus:border-gold transition-colors"
                />
                {/* Loading indicator */}
                {searching && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold/40 overflow-hidden">
                    <div className="h-full w-1/3 bg-gold animate-pulse rounded-full" />
                  </div>
                )}
              </div>

              {/* Search results */}
              {results.length > 0 && (
                <div className="border border-border-subtle mb-6 max-h-[200px] overflow-y-auto">
                  {results.map((r, i) => (
                    <button
                      key={`${r.lat}-${r.lng}-${i}`}
                      onClick={() => handleSelectResult(r)}
                      className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-border-subtle last:border-b-0"
                    >
                      <span className="block text-sm text-text-primary font-medium">{r.name}</span>
                      <span className="block text-xs text-text-muted mt-0.5 truncate">{r.displayName}</span>
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && !searching && results.length === 0 && (
                <p className="text-text-muted text-xs italic mb-6 pl-1">No cities found. Try a different search.</p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-[1px] bg-border-subtle" />
                <span className="text-text-muted text-xs font-sans uppercase tracking-widest">or</span>
                <div className="flex-1 h-[1px] bg-border-subtle" />
              </div>

              {/* Use GPS */}
              <button
                onClick={handleUseGPS}
                disabled={gpsLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gold/40 text-gold text-xs uppercase tracking-widest font-sans font-medium hover:bg-gold/5 transition-colors disabled:opacity-50 mb-2"
              >
                <LocateFixed size={14} className={gpsLoading ? 'animate-pulse' : ''} />
                {gpsLoading ? 'Detecting…' : 'Use My Current Location'}
              </button>

              {gpsErr && (
                <p className="text-red-400/70 text-xs text-center mb-4">{gpsErr}</p>
              )}

              {/* Popular cities */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-[1px] bg-border-subtle" />
                  <span className="label-gold text-[10px]">Popular Cities</span>
                  <div className="flex-1 h-[1px] bg-border-subtle" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleSelectResult(city)}
                      className="px-3.5 py-1.5 border border-gold/20 text-text-primary text-xs font-sans rounded-full hover:border-gold hover:text-gold transition-colors"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LocationPicker;
