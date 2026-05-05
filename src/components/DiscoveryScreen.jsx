import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Pencil } from 'lucide-react';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { useLocation } from '../hooks/useLocation';
import { fetchPlacePhoto } from '../utils/nearbyPlaces';
import LocationPicker from './LocationPicker';

// ─── Ken Burns hero images (Wikimedia Commons, free) ─────────────────────────

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1280&q=80',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&q=80',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1280&q=80',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1280&q=80',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1280&q=80',
];

// ─── Hero Background ─────────────────────────────────────────────────────────

const HeroBackground = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {HERO_IMAGES.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          onLoad={() => setLoaded((p) => ({ ...p, [i]: true }))}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ${
            i === currentIdx && loaded[i] ? 'opacity-100 ken-burns' : 'opacity-0'
          }`}
          style={{ animationDuration: '6s' }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.55) 50%, rgba(13,13,13,1) 100%)',
        }}
      />
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.5)' }} />
    </div>
  );
};

// ─── Skeleton Card ───────────────────────────────────────────────────────────

const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    className="flex-shrink-0 w-[200px] h-[280px] skeleton-shimmer"
  />
);

// ─── Place Card — Editorial ──────────────────────────────────────────────────

const PlaceCard = ({ place, index, onClick }) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotoUrl(null);
     
    setPhotoLoaded(false);
    fetchPlacePhoto(place.name).then((url) => {
      if (!cancelled) setPhotoUrl(url);
    });
    return () => { cancelled = true; };
  }, [place.name]);



  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
      onClick={onClick}
      className="flex-shrink-0 w-[200px] h-[280px] bg-bg-card relative overflow-hidden text-left group cursor-pointer"
    >
      <div className="h-[65%] overflow-hidden relative bg-bg-secondary">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            onLoad={() => setPhotoLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.08] ${
              photoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
            <span className="text-5xl font-display text-text-muted/30 select-none">{place.name.charAt(0)}</span>
          </div>
        )}
        {!photoLoaded && photoUrl && <div className="absolute inset-0 skeleton-shimmer" />}
      </div>

      <div className="h-[35%] p-3 flex flex-col justify-center">
        <span className="label-gold mb-1">{place.type.toUpperCase()}</span>
        <h3 className="font-display text-base text-text-primary leading-tight line-clamp-2 group-hover:text-gold transition-colors duration-300">
          {place.name}
        </h3>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    </motion.button>
  );
};

// ─── Image Preview Overlay ───────────────────────────────────────────────────

const ImagePreviewOverlay = ({ previewUrl, onDiscover, onClose }) => (
  <motion.div
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    exit={{ y: '100%' }}
    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col p-6"
  >
    <button onClick={onClose} className="self-start p-2 text-text-secondary hover:text-text-primary transition-colors mb-6">
      <X size={20} />
    </button>
    <div className="flex-1 flex flex-col items-center justify-center gap-10 max-w-2xl mx-auto w-full">
      <div className="relative w-full aspect-video overflow-hidden border border-border-subtle">
        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/50" />
      </div>
      <button
        onClick={onDiscover}
        className="flex items-center gap-3 px-8 py-3.5 bg-gold text-background font-sans text-xs uppercase tracking-widest font-medium hover:bg-gold-light transition-colors duration-300"
      >
        <Sparkles size={16} />
        Discover Story
      </button>
    </div>
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════════════════
//  DISCOVERY SCREEN
// ═════════════════════════════════════════════════════════════════════════════

const DiscoveryScreen = ({ onAnalyzeImage, onAnalyzePlace }) => {
  const { location, cityName, setManualLocation, resetToGPS } = useLocation();
  const { places, loading: placesLoading, error: placesError } = useNearbyPlaces(location);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleDiscover = () => {
    if (selectedFile && previewUrl) {
      onAnalyzeImage(selectedFile, previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background relative"
    >
      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-end">
        <HeroBackground />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="label-gold block mb-4">Discover</span>
            <h2 className="font-display text-[40px] sm:text-[52px] text-text-primary leading-[1.1] mb-4">
              The Story<br />Behind Every<br />Masterpiece
            </h2>
            <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
              Point your lens at any monument, artwork, or cultural landmark and unveil centuries of history.
            </p>
            <div className="flex gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 px-8 py-3.5 border border-gold text-gold bg-transparent hover:bg-gold hover:text-background transition-all duration-300 cursor-pointer font-sans text-xs uppercase tracking-widest font-medium">
                Upload Artwork
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </label>
              <label className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-background hover:bg-gold-light transition-all duration-300 cursor-pointer font-sans text-xs uppercase tracking-widest font-medium">
                Use Camera
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileSelect} />
              </label>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Nearby Wonders Section ─────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="divider-gold mb-6" />

          {/* Section header with clickable location badge */}
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-display text-3xl sm:text-4xl text-text-primary">Nearby Wonders</h2>

            <button
              onClick={() => setLocationPickerOpen(true)}
              className="flex items-center gap-1.5 group"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={cityName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="label-gold flex items-center gap-1"
                >
                  <span className="text-xs">📍</span> {cityName}
                </motion.span>
              </AnimatePresence>
              <Pencil size={11} className="text-gold/40 group-hover:text-gold transition-colors" />
            </button>
          </div>

          <div className="divider-gold mb-8" />

          {/* Place cards scroll row */}
          <div className="overflow-x-auto -mx-6 px-6 pb-4 scrollbar-hide">
            <div className="flex gap-4">
              {placesLoading &&
                [...Array(6)].map((_, i) => <SkeletonCard key={i} index={i} />)}

              {!placesLoading && places.length > 0 &&
                places.map((place, i) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    index={i}
                    onClick={() => onAnalyzePlace(place.name, place.lat, place.lng)}
                  />
                ))}

              {!placesLoading && places.length === 0 && !placesError && (
                <p className="text-text-muted text-sm py-12 font-sans">
                  No cultural sites found nearby. Try uploading a photo instead.
                </p>
              )}

              {placesError && (
                <p className="text-text-muted text-sm py-8 font-sans italic">{placesError}</p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Location Picker ────────────────────────────────────────── */}
      <LocationPicker
        isOpen={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onSelectCity={setManualLocation}
        onUseGPS={() => {
          resetToGPS();
          setLocationPickerOpen(false);
        }}
      />

      {/* ─── Image Preview Overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {previewUrl && (
          <ImagePreviewOverlay
            previewUrl={previewUrl}
            onDiscover={handleDiscover}
            onClose={handleClosePreview}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiscoveryScreen;
