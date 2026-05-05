import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, MapPin, Settings, X, Sparkles, RefreshCw } from 'lucide-react';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { fetchPlacePhoto, formatDistance } from '../utils/nearbyPlaces';

// ─── Background Orbs ────────────────────────────────────────────────────────

const BackgroundOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="orb orb-purple" />
    <div className="orb orb-cyan" />
  </div>
);

// ─── Skeleton Card ───────────────────────────────────────────────────────────

const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.08 }}
    className="flex-shrink-0 w-[160px] h-[220px] rounded-2xl skeleton-shimmer"
  />
);

// ─── Place Card (with lazy Wikimedia photo) ──────────────────────────────────

const PlaceCard = ({ place, index, onClick }) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(true);

  // Lazy-load photo from Wikimedia
  useEffect(() => {
    let cancelled = false;
    fetchPlacePhoto(place.name).then((url) => {
      if (!cancelled) {
        setPhotoUrl(url);
        setPhotoLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [place.name]);

  const distanceLabel = formatDistance(place.distance);

  return (
    <motion.button
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-shrink-0 w-[160px] h-[220px] rounded-2xl relative overflow-hidden border border-white/10
                 hover:shadow-[0_0_25px_rgba(124,58,237,0.3)] transition-shadow cursor-pointer text-left group"
    >
      {/* Card background: shimmer → photo → gradient fallback */}
      {photoLoading ? (
        <div className="absolute inset-0 skeleton-shimmer" />
      ) : photoUrl ? (
        <img src={photoUrl} alt={place.name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/30 to-secondary/50 flex items-center justify-center">
          <span className="text-6xl font-bold text-white/20 group-hover:text-white/30 transition-colors select-none">
            {place.name.charAt(0)}
          </span>
        </div>
      )}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
        }}
      />

      {/* Category icon */}
      <span className="absolute top-2.5 right-2.5 text-lg select-none drop-shadow-lg">
        {place.typeIcon}
      </span>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1.5">
          {place.name}
        </p>
        <span className="inline-block px-2 py-0.5 bg-secondary/30 text-secondary text-[11px] font-medium rounded-full border border-secondary/30">
          {distanceLabel}
        </span>
      </div>
    </motion.button>
  );
};

// ─── Image Preview Overlay ───────────────────────────────────────────────────

const ImagePreviewOverlay = ({ previewUrl, onDiscover, onClose }) => (
  <motion.div
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    exit={{ y: '100%' }}
    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
    className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col p-4"
  >
    <button
      onClick={onClose}
      className="self-start p-2 text-gray-400 hover:text-white transition-colors mb-4"
    >
      <X size={24} />
    </button>

    <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-xl mx-auto w-full">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-primary shadow-[0_0_30px_rgba(124,58,237,0.2)]">
        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/50" />
      </div>

      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(124, 58, 237, 0.6)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onDiscover}
        className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full text-lg shadow-lg"
      >
        <Sparkles size={24} />
        Discover Story
      </motion.button>
    </div>
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════════════════
//  DISCOVERY SCREEN
// ═════════════════════════════════════════════════════════════════════════════

const DiscoveryScreen = ({ onAnalyzeImage, onAnalyzePlace }) => {
  const { places, loading: placesLoading, cityName, error: placesError } = useNearbyPlaces();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [particles, setParticles] = useState([]);

  // Generate particles on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      [...Array(12)].map(() => ({
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 6 + 3}px`,
        height: `${Math.random() * 6 + 3}px`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${Math.random() * 10 + 10}s`,
      }))
    );
  }, []);

  // ── File selection ──────────────────────────────────────────────────────

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

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background relative"
    >
      <BackgroundOrbs />

      {/* Subtle particles */}
      <div className="particles-container">
        {particles.map((style, i) => (
          <div key={i} className="particle" style={style} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-8 max-w-[600px] mx-auto">

        {/* ─── App Header ─────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-3 mb-4"
        >
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            🔮 Cultural Lens
          </h1>
          <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
            <Settings size={18} />
          </button>
        </motion.header>

        {/* ─── Top Section: Upload + Camera cards ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {/* Upload Photo Card */}
          <label className="group relative h-[180px] rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 backdrop-blur-sm
                            flex flex-col items-center justify-center gap-3 cursor-pointer
                            hover:border-primary hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98]
                            transition-all duration-200 overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Upload size={24} className="text-primary" />
            </div>
            <span className="text-white font-semibold text-sm">Upload Photo</span>
            <span className="text-gray-400 text-xs">From your gallery</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
          </label>

          {/* Use Camera Card */}
          <label className="group relative h-[180px] rounded-2xl border-2 border-dashed border-secondary/40 bg-secondary/5 backdrop-blur-sm
                            flex flex-col items-center justify-center gap-3 cursor-pointer
                            hover:border-secondary hover:bg-secondary/10 hover:scale-[1.02] active:scale-[0.98]
                            transition-all duration-200 overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
              <Camera size={24} className="text-secondary" />
            </div>
            <span className="text-white font-semibold text-sm">Use Camera</span>
            <span className="text-gray-400 text-xs">Take a photo</span>
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileSelect} />
          </label>
        </motion.div>

        {/* ─── Bottom Section: Nearby Wonders ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Nearby Wonders</h2>
            {cityName && (
              <span className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                <MapPin size={12} className="text-secondary" />
                {cityName}
              </span>
            )}
          </div>

          {/* Place cards scroll row */}
          <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
            <div className="flex gap-3">
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
                <div className="w-full py-12 text-center text-gray-500 text-sm">
                  No cultural sites found nearby. Try uploading a photo instead!
                </div>
              )}

              {placesError && (
                <div className="w-full py-8 text-center flex flex-col items-center gap-3">
                  <p className="text-gray-500 text-sm">{placesError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1.5 text-xs text-secondary border border-secondary/30 px-3 py-1.5 rounded-full hover:bg-secondary/10 transition-colors"
                  >
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

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
