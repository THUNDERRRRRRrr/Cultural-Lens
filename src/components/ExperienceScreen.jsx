import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

const ExperienceScreen = ({ data, imageUrl, onBack, usedAPI }) => {
  const [currentLangCode, setCurrentLangCode] = useState('en-IN');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const speech = useSpeech();

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
    speech.stop();

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + currentNarration.charAt(index));
      index++;
      if (index >= currentNarration.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNarration]);

  const handleShare = async () => {
    const shareText = `${data.name} — ${data.location}\n\n${data.funFacts?.[0]}\n\nDiscovered via Cultural Lens.`;
    if (navigator.share) {
      try { await navigator.share({ title: data.name, text: shareText }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  const handlePlay = () => speech.play(currentNarration, currentLangCode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      {/* ─── Top Bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => { speech.stop(); onBack(); }}
            className="flex items-center gap-2 text-text-secondary hover:text-gold transition-colors text-xs uppercase tracking-widest font-sans"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-text-secondary hover:text-gold transition-colors text-xs uppercase tracking-widest font-sans"
            >
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-56px)]">

        {/* Left Column — Image */}
        <div className="lg:col-span-5 relative lg:border-r border-border-subtle">
          <div className="lg:sticky lg:top-14 lg:h-[calc(100vh-56px)]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[50vh] bg-bg-secondary flex items-center justify-center">
                <span className="text-[140px] font-display text-text-muted/10 select-none">
                  {data.name?.charAt(0)}
                </span>
              </div>
            )}
            {/* Category tag over image */}
            <div className="absolute top-6 left-6 px-3 py-1.5 bg-background/70 backdrop-blur-sm">
              <span className="label-gold">Cultural Heritage</span>
            </div>
          </div>
        </div>

        {/* Right Column — Content */}
        <div className="lg:col-span-7 px-6 lg:px-12 py-12 lg:py-16">

          {/* Label + Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-gold" />
              <span className="label-gold">Cultural Heritage</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl text-text-primary leading-[1.15] mb-3">
              {data.name}
            </h1>
            <p className="text-text-secondary text-sm flex items-center gap-1 mb-8">
              📍 {data.location}
            </p>
          </motion.div>

          <div className="divider-gold mb-8" />

          {/* Voice + Language Controls — minimal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              {speech.supported && (
                <>
                  {!speech.isPlaying ? (
                    <button onClick={handlePlay} className="label-gold hover:text-gold-light transition-colors">
                      &#9654; Narrate
                    </button>
                  ) : (
                    <>
                      <button onClick={speech.isPaused ? speech.resume : speech.pause} className="label-gold hover:text-gold-light transition-colors">
                        {speech.isPaused ? '&#9654; Resume' : '&#10074;&#10074; Pause'}
                      </button>
                      <button onClick={speech.stop} className="label-gold hover:text-gold-light transition-colors">
                        &#9632; Stop
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <select
              value={currentLangCode}
              onChange={(e) => setCurrentLangCode(e.target.value)}
              className="bg-transparent border border-border-subtle px-3 py-1.5 text-xs text-text-secondary font-sans outline-none focus:border-gold transition-colors cursor-pointer"
            >
              <option value="en-IN" className="bg-background">English</option>
              <option value="hi-IN" className="bg-background">हिंदी</option>
              <option value="bn-IN" className="bg-background">বাংলা</option>
            </select>
          </motion.div>

          {/* Narration */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-12"
          >
            <p className={`text-[15px] text-text-primary leading-[1.9] font-light ${isTyping ? 'typing-cursor' : ''}`}>
              {displayedText}
            </p>
          </motion.div>

          {/* Curator's Notes (Fun Facts) */}
          {data.funFacts && data.funFacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mb-12"
            >
              <span className="label-gold block mb-5">Curator&apos;s Notes</span>
              <div className="space-y-4">
                {data.funFacts.map((fact, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-[3px] bg-gold/30 flex-shrink-0 mt-1 self-stretch" />
                    <p className="text-text-secondary text-sm leading-relaxed">{fact}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Historical Record (Timeline) */}
          {data.timeline && data.timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mb-12"
            >
              <span className="label-gold block mb-5">Historical Record</span>
              <div className="relative pl-6">
                {/* Vertical gold line */}
                <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-gold/20" />

                <div className="space-y-5">
                  {data.timeline.map((event, i) => (
                    <div key={i} className="relative">
                      {/* Dot on line */}
                      <div className="absolute -left-6 top-1.5 w-[7px] h-[7px] bg-gold/50 rounded-full" style={{ transform: 'translateX(-3px)' }} />
                      <span className="text-gold font-sans text-sm font-semibold">{event.year}</span>
                      <p className="text-text-secondary text-sm mt-0.5 leading-relaxed">{event.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* API badge */}
      {usedAPI && (
        <div className="fixed bottom-4 left-6 z-40 label-gold opacity-30 hover:opacity-80 transition-opacity select-none">
          Powered by {usedAPI}
        </div>
      )}
    </motion.div>
  );
};

export default ExperienceScreen;
