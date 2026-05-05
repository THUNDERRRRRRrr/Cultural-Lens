import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingScreen from './components/LandingScreen';
import CaptureScreen from './components/CaptureScreen';
import ExperienceScreen from './components/ExperienceScreen';
import { useAnalyzer } from './hooks/useAnalyzer';

function App() {
  // 'landing' | 'capture-upload' | 'capture-camera' | 'experience'
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [capturedImage, setCapturedImage] = useState(null);
  
  const { analyzeImage, loading, error, result, setResult, usedAPI } = useAnalyzer();

  const handleNavigateToCapture = (mode) => {
    setCurrentScreen(mode === 'camera' ? 'capture-camera' : 'capture-upload');
  };

  const handleDiscover = async (file, previewUrl) => {
    setCapturedImage(previewUrl);
    await analyzeImage(file);
    if (!error) {
      setCurrentScreen('experience');
    }
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
    setCapturedImage(null);
    setResult(null);
  };

  const handleBackToCapture = () => {
    setCurrentScreen('capture-upload'); // or whichever they were on, but default to upload
    setCapturedImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans overflow-x-hidden">
      
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-secondary rounded-full animate-spin"></div>
              <p className="text-xl font-light text-white tracking-widest animate-pulse">Unveiling history...</p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Error Overlay */}
      <AnimatePresence>
        {error && !loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white/10 border border-red-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h3 className="text-2xl font-bold text-red-400 mb-4">Discovery Paused</h3>
              <p className="text-gray-300 mb-8">{error}</p>
              <button 
                onClick={() => { setResult(null); setCurrentScreen('landing'); }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-gray-600 rounded-full transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && (
          <LandingScreen 
            key="landing" 
            onNavigate={handleNavigateToCapture} 
          />
        )}
        
        {(currentScreen === 'capture-upload' || currentScreen === 'capture-camera') && (
          <CaptureScreen 
            key="capture"
            mode={currentScreen.replace('capture-', '')} 
            onBack={handleBackToLanding}
            onDiscover={handleDiscover}
          />
        )}
        
        {currentScreen === 'experience' && result && capturedImage && (
          <ExperienceScreen 
            key="experience"
            data={result}
            imageUrl={capturedImage}
            onBack={handleBackToCapture}
            usedAPI={usedAPI}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-40 text-xs text-gray-600 font-light opacity-50 hover:opacity-100 transition-opacity">
        Built with Cultural Lens
      </div>
    </div>
  );
}

export default App;
