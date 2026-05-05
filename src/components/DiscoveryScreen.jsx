import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Pencil, ChevronDown } from 'lucide-react';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { useLocation } from '../hooks/useLocation';
import { fetchPlacePhoto } from '../utils/nearbyPlaces';
import { useReducedMotion } from '../hooks/useReducedMotion';
import LocationPicker from './LocationPicker';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1280&q=80',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=1280&q=80',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1280&q=80',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1280&q=80',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1280&q=80',
];

const HeroBackground = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loaded, setLoaded] = useState({});
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
            i === currentIdx && loaded[i] ? 'opacity-100' : 'opacity-0'
          } ${!isMobile ? 'ken-burns' : ''}`}
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

const SkeletonCard = ({ index, shouldReduce }) => {
  const variants = shouldReduce ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.08, duration: 0.5 }
  };

  return (
    <motion.div
      {...variants}
      className="flex-shrink-0 w-[170px] md:w-[200px] h-[240px] md:h-[280px] skeleton-shimmer"
      style={{ scrollSnapAlign: 'start' }}
    />
  );
};

const PlaceCard = ({ place, index, onClick, shouldReduce }) => {
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

  const variants = shouldReduce ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.2 + index * 0.08, duration: 0.5 }
  };

  return (
    <motion.button
      {...variants}
      onClick={onClick}
      className="flex-shrink-0 w-[170px] md:w-[200px] h-[240px] md:h-[280px] bg-bg-card relative overflow-hidden text-left group cursor-pointer active:scale-95 active:opacity-80 transition-transform duration-75"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="h-[65%] overflow-hidden relative bg-bg-secondary">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            loading="lazy"
            decoding="async"
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
        <h3 className="font-display text-sm md:text-base text-text-primary leading-tight line-clamp-2 group-hover:text-gold transition-colors duration-300">
          {place.name}
        </h3>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    </motion.button>
  );
};

const ImagePreviewOverlay = ({ previewUrl, onDiscover, onClose }) => (
  <motion.div
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    exit={{ y: '100%' }}
    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    className="fixed inset-0 z-50 glass-card flex flex-col p-6"
  >
    <button onClick={onClose} className="self-start p-2 text-text-secondary hover:text-text-primary transition-colors mb-6 active:scale-95 active:opacity-80">
      <X size={20} />
    </button>
    <div className="flex-1 flex flex-col items-center justify-center gap-10 max-w-2xl mx-auto w-full">
      <div className="relative w-full aspect-video overflow-hidden border border-border-subtle">
        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/50" />
      </div>
      <button
        onClick={onDiscover}
        className="flex items-center gap-3 px-8 py-3.5 bg-gold text-background font-sans text-xs uppercase tracking-widest font-medium hover:bg-gold-light transition-colors duration-300 active:scale-95 active:opacity-80"
      >
        <Sparkles size={16} />
        Discover Story
      </button>
    </div>
  </motion.div>
);

const DiscoveryScreen = ({ onAnalyzeImage, onAnalyzePlace }) => {
  const { location, cityName, setManualLocation, resetToGPS } = useLocation();
  const { places, loading: placesLoading, error: placesError } = useNearbyPlaces(location, cityName);
  const shouldReduce = useReducedMotion();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const heroVariants = shouldReduce ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.2 }
  };

  const sectionVariants = shouldReduce ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.5 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background relative pb-8 md:pb-0"
    >
      <section className="relative min-h-[55vh] md:min-h-[65vh] flex items-end">
        <HeroBackground />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16 md:pb-16">
          <motion.div {...heroVariants}>
            <span className="label-gold block mb-4">Discover</span>
            <h2 className="font-display text-[40px] sm:text-[52px] text-text-primary leading-[1.15] mb-4">
              The Story<br />Behind Every<br />Masterpiece
            </h2>
            <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
              Point your lens at any monument, artwork, or cultural landmark and unveil centuries of history.
            </p>
            <div className="flex gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 px-8 py-3.5 border border-gold text-gold bg-transparent hover:bg-gold hover:text-background transition-all duration-300 cursor-pointer font-sans text-xs uppercase tracking-widest font-medium active:scale-95 active:opacity-80">
                Upload Artwork
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </label>
              <label className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-background hover:bg-gold-light transition-all duration-300 cursor-pointer font-sans text-xs uppercase tracking-widest font-medium active:scale-95 active:opacity-80">
                Use Camera
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileSelect} />
              </label>
            </div>
          </motion.div>
        </div>
        
        {/* Animated Arrow on Mobile */}
        {!scrolled && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/60 animate-bounce md:hidden pointer-events-none">
            <ChevronDown size={24} />
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto pt-10 md:pt-16 pb-8 px-0 md:px-6">
        <motion.div {...sectionVariants} className="px-6 md:px-0">
          <div className="divider-gold mb-6" />

          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-display text-3xl sm:text-4xl text-text-primary">Nearby Wonders</h2>

            <button
              onClick={() => setLocationPickerOpen(true)}
              className="flex items-center gap-1.5 group active:scale-95 transition-transform"
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
        </motion.div>

        <div 
          className="overflow-x-auto px-6 md:px-0 pb-4 scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            overflowX: 'scroll',
            scrollBehavior: 'smooth',
          }}
        >
          <div className="flex gap-4 w-max pr-6 md:pr-0">
            {placesLoading &&
              [...Array(6)].map((_, i) => <SkeletonCard key={i} index={i} shouldReduce={shouldReduce} />)}

            {!placesLoading && places.length > 0 &&
              places.map((place, i) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  index={i}
                  shouldReduce={shouldReduce}
                  onClick={() => onAnalyzePlace(place.name, place.lat, place.lng)}
                />
              ))}

            {!placesLoading && places.length === 0 && !placesError && (
              <div className="py-10 px-2 flex flex-col items-center justify-center w-[85vw] md:w-full border border-border-subtle bg-bg-card/50 relative overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <span className="font-display text-[200px]">?</span>
                </div>
                <h3 className="font-display italic text-2xl text-text-primary mb-2 text-center">No wonders found nearby</h3>
                <p className="text-text-muted text-sm font-sans mb-6 text-center">Try changing your location or upload a photo</p>
                <button 
                  onClick={() => setLocationPickerOpen(true)}
                  className="px-6 py-2.5 border border-gold text-gold font-sans text-xs uppercase tracking-widest font-medium hover:bg-gold/10 transition-colors active:scale-95"
                >
                  Change Location
                </button>
              </div>
            )}

            {placesError && (
              <p className="text-text-muted text-sm py-8 font-sans italic pl-6 md:pl-0">{placesError}</p>
            )}
          </div>
        </div>
      </section>

      <LocationPicker
        isOpen={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onSelectCity={setManualLocation}
        onUseGPS={() => {
          resetToGPS();
          setLocationPickerOpen(false);
        }}
      />

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
