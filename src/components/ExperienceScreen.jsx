import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info, Share2, ArrowLeft } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import VoicePlayer from './VoicePlayer';
import Timeline from './Timeline';
import { useSpeech } from '../hooks/useSpeech';

const ExperienceScreen = ({ data, imageUrl, onBack, usedAPI }) => {
  const [currentLangCode, setCurrentLangCode] = useState('en-IN');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const speech = useSpeech();

  // Get the correct narration text based on language
  const getNarrationText = () => {
    switch (currentLangCode) {
      case 'hi-IN': return data.hindiNarration || data.narration;
      case 'bn-IN': return data.bengaliNarration || data.narration;
      default: return data.narration;
    }
  };

  const currentNarration = getNarrationText();

  // Typewriter effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    
    // Stop any ongoing speech when text changes
    speech.stop();

    const interval = setInterval(() => {
      setDisplayedText(prev => prev + currentNarration.charAt(index));
      index++;
      if (index >= currentNarration.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20); // 20ms per character

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNarration]);

  const handleLanguageChange = (langCode) => {
    setCurrentLangCode(langCode);
  };

  const handleShare = async () => {
    const shareText = `Check out ${data.name} in ${data.location}!\n\n${data.funFacts?.[0]}\n\nDiscovered via Cultural Lens.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text: shareText,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Summary copied to clipboard!");
    }
  };

  const handlePlay = () => speech.play(currentNarration, currentLangCode);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background p-4 md:p-8 flex flex-col"
    >
      <button 
        onClick={() => { speech.stop(); onBack(); }}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 self-start transition-colors"
      >
        <ArrowLeft size={20} /> Back to Capture
      </button>

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image & Basic Info */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative rounded-3xl overflow-hidden border border-primary shadow-[0_0_40px_rgba(124,58,237,0.2)] aspect-[4/5] bg-black">
            <img 
              src={imageUrl} 
              alt={data.name} 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-2 text-white"
              >
                {data.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-secondary text-lg"
              >
                <MapPin size={20} />
                <span>{data.location}</span>
              </motion.div>
            </div>
          </div>

          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-xl transition-colors backdrop-blur-sm"
          >
            <Share2 size={18} />
            Share Discovery
          </button>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:pl-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-background/90 py-2 z-10 backdrop-blur-xl">
            <VoicePlayer 
              isPlaying={speech.isPlaying}
              isPaused={speech.isPaused}
              onPlay={handlePlay}
              onPause={speech.pause}
              onResume={speech.resume}
              onStop={speech.stop}
              supported={speech.supported}
            />
            <LanguageSelector 
              currentLang={currentLangCode} 
              onChange={handleLanguageChange} 
            />
          </div>

          {/* Narration */}
          <div className="bg-white/5 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm mt-2">
            <p className={`text-lg md:text-xl text-gray-200 leading-relaxed font-light ${isTyping ? 'typing-cursor' : ''}`}>
              {displayedText}
            </p>
          </div>

          {/* Fun Facts */}
          {data.funFacts && data.funFacts.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
                <Info size={20} />
                Fascinating Facts
              </h3>
              <ul className="space-y-3">
                {data.funFacts.map((fact, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    className="flex gap-3 text-gray-300"
                  >
                    <span className="text-secondary mt-1">•</span>
                    <span>{fact}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          {data.timeline && data.timeline.length > 0 && (
            <Timeline events={data.timeline} />
          )}

        </div>
      </div>

      {/* API Provider Badge */}
      {usedAPI && (
        <div className="fixed bottom-4 left-4 z-40 text-[10px] text-gray-500 font-light opacity-40 hover:opacity-100 transition-opacity select-none">
          Powered by {usedAPI}
        </div>
      )}
    </motion.div>
  );
};

export default ExperienceScreen;
