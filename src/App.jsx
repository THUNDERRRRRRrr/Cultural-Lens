import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DiscoveryScreen from './components/DiscoveryScreen';
import ExperienceScreen from './components/ExperienceScreen';
import { useAnalyzer } from './hooks/useAnalyzer';

function App() {
  // 'discovery' | 'experience'
  const [currentScreen, setCurrentScreen] = useState('discovery');
  const [capturedImage, setCapturedImage] = useState(null);

  const { analyzeImage, analyzeByName, loading, error, result, setResult, setError, usedAPI } = useAnalyzer();

  // ── Upload / Camera flow ────────────────────────────────────────────────

  const handleAnalyzeImage = async (file, previewUrl) => {
    setCapturedImage(previewUrl);
    await analyzeImage(file);
    setCurrentScreen('experience');
  };

  // ── Nearby place card flow ──────────────────────────────────────────────

  const handleAnalyzePlace = async (placeName, lat, lng) => {
    setCapturedImage(null); // no image for place cards
    await analyzeByName(placeName, lat, lng);
    setCurrentScreen('experience');
  };

  // ── Navigation ──────────────────────────────────────────────────────────

  const handleBackToDiscovery = () => {
    setCurrentScreen('discovery');
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans overflow-x-hidden">

      {/* ─── Loading Overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 border-4 border-primary border-t-secondary rounded-full animate-spin" />
              <p className="text-xl font-light text-white tracking-widest animate-pulse">
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          >
            <div className="bg-white/10 border border-red-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h3 className="text-2xl font-bold text-red-400 mb-4">Discovery Paused</h3>
              <p className="text-gray-300 mb-8">{error}</p>
              <button
                onClick={handleBackToDiscovery}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-gray-600 rounded-full transition-colors"
              >
                Try Again
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
