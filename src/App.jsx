import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DiscoveryScreen from './components/DiscoveryScreen';
import ExperienceScreen from './components/ExperienceScreen';
import { useAnalyzer } from './hooks/useAnalyzer';

function App() {
  const [currentScreen, setCurrentScreen] = useState('discovery');
  const [capturedImage, setCapturedImage] = useState(null);

  const { analyzeImage, analyzeByName, loading, error, result, setResult, setError, usedAPI } = useAnalyzer();

  const handleAnalyzeImage = async (file, previewUrl) => {
    setCapturedImage(previewUrl);
    await analyzeImage(file);
    setCurrentScreen('experience');
  };

  const handleAnalyzePlace = async (placeName, lat, lng) => {
    setCapturedImage(null);
    await analyzeByName(placeName, lat, lng);
    setCurrentScreen('experience');
  };

  const handleBackToDiscovery = () => {
    setCurrentScreen('discovery');
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans overflow-x-hidden">

      {/* Grain overlay — cinematic film texture */}
      <div className="grain-overlay" />

      {/* ─── App Header ───────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[1px] h-5 bg-gold" />
            <span className="font-display italic text-gold text-xl tracking-wide">Cultural Lens</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <button
              onClick={() => { if (currentScreen !== 'discovery') handleBackToDiscovery(); }}
              className="text-text-secondary hover:text-gold transition-colors text-[11px] uppercase tracking-[0.15em] font-sans font-medium"
            >
              Discover
            </button>
            <label className="text-text-secondary hover:text-gold transition-colors text-[11px] uppercase tracking-[0.15em] font-sans font-medium cursor-pointer">
              Upload
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAnalyzeImage(file, URL.createObjectURL(file));
              }} />
            </label>
            <span className="text-text-muted text-[11px] uppercase tracking-[0.15em] font-sans font-medium cursor-default">
              About
            </span>
          </nav>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[60px]" />

      {/* ─── Loading Overlay — museum loader ──────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="museum-loader" />
              <p className="font-display italic text-gold/70 text-lg tracking-wide">
                Unveiling history…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Error Overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-6"
          >
            <div className="border border-border-subtle bg-bg-card p-10 max-w-md w-full text-center">
              <p className="font-display italic text-text-primary text-lg mb-6">{error}</p>
              <button
                onClick={handleBackToDiscovery}
                className="px-6 py-2.5 border border-gold text-gold text-xs uppercase tracking-widest font-sans hover:bg-gold hover:text-background transition-all duration-300"
              >
                Return
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Screens ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {currentScreen === 'discovery' && (
          <DiscoveryScreen
            key="discovery"
            onAnalyzeImage={handleAnalyzeImage}
            onAnalyzePlace={handleAnalyzePlace}
          />
        )}

        {currentScreen === 'experience' && result && (
          <ExperienceScreen
            key="experience"
            data={result}
            imageUrl={capturedImage}
            onBack={handleBackToDiscovery}
            usedAPI={usedAPI}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
