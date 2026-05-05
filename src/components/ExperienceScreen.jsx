import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Play, Pause, Square } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ExperienceScreen = ({ data, imageUrl, onBack, usedAPI }) => {
  const [currentLangCode, setCurrentLangCode] = useState('en-IN');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const speech = useSpeech();
  const shouldReduce = useReducedMotion();

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

  const containerVariants = shouldReduce ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 }
  };

  const contentVariants = shouldReduce ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div
      {...containerVariants}
      className="min-h-screen bg-background pb-[72px] md:pb-0"
    >
      {/* ─── Top Bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 glass-card border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => { speech.stop(); onBack(); }}
            className="flex items-center gap-2 text-text-secondary hover:text-gold transition-colors text-xs uppercase tracking-widest font-sans active:scale-95"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-text-secondary hover:text-gold transition-colors text-xs uppercase tracking-widest font-sans active:scale-95"
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
          <div className="lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] aspect-[4/3] md:aspect-auto w-full overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                <span className="text-[140px] font-display text-text-muted/10 select-none">
                  {data.name?.charAt(0)}
                </span>
              </div>
            )}
            {/* Category tag over image */}
            <div className="absolute top-6 left-6 px-3 py-1.5 bg-background/70 glass-card rounded-none">
              <span className="label-gold">Cultural Heritage</span>
            </div>
          </div>
        </div>

        {/* Right Column — Content */}
        <div className="lg:col-span-7 px-6 lg:px-12 py-8 md:py-12 lg:py-16">

          {/* Title */}
          <motion.div
            {...contentVariants}
            transition={{ ...contentVariants.transition, delay: shouldReduce ? 0 : 0.2 }}
          >
            <h1 className="font-display text-[40px] sm:text-5xl text-text-primary leading-[1.15] mb-3 text-left">
              {data.name}
            </h1>
            <p className="text-text-secondary text-sm flex items-center gap-1 mb-6">
              📍 {data.location}
            </p>
          </motion.div>

          <div className="divider-gold mb-6 md:mb-8" />

          {/* Voice + Language Controls (Desktop only for voice) */}
          <motion.div
            {...contentVariants}
            transition={{ ...contentVariants.transition, delay: shouldReduce ? 0 : 0.4 }}
            className="flex flex-row-reverse md:flex-row items-center justify-between md:justify-between mb-8"
          >
            <div className="hidden md:flex items-center gap-4">
              {speech.supported && (
                <>
                  {!speech.isPlaying ? (
                    <button onClick={handlePlay} className="label-gold hover:text-gold-light transition-colors active:scale-95 flex items-center gap-1.5">
                      <Play size={12} /> Narrate
                    </button>
                  ) : (
                    <>
                      <button onClick={speech.isPaused ? speech.resume : speech.pause} className="label-gold hover:text-gold-light transition-colors active:scale-95 flex items-center gap-1.5">
                        {speech.isPaused ? <><Play size={12}/> Resume</> : <><Pause size={12}/> Pause</>}
                      </button>
                      <button onClick={speech.stop} className="label-gold hover:text-gold-light transition-colors active:scale-95 flex items-center gap-1.5">
                        <Square size={12} /> Stop
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <select
              value={currentLangCode}
              onChange={(e) => setCurrentLangCode(e.target.value)}
              className="bg-transparent border border-border-subtle px-3 py-1.5 text-xs text-text-secondary font-sans outline-none focus:border-gold transition-colors cursor-pointer w-auto"
            >
              <option value="en-IN" className="bg-background">English</option>
              <option value="hi-IN" className="bg-background">हिंदी</option>
              <option value="bn-IN" className="bg-background">বাংলা</option>
            </select>
          </motion.div>

          {/* Narration */}
          <motion.div
            {...contentVariants}
            transition={{ ...contentVariants.transition, delay: shouldReduce ? 0 : 0.5 }}
            className="mb-12"
          >
            <p className={`text-[15px] text-text-primary leading-[1.9] font-sans ${isTyping ? 'typing-cursor' : ''}`}>
              {displayedText}
            </p>
          </motion.div>

          {/* Curator's Notes (Fun Facts) */}
          {data.funFacts && data.funFacts.length > 0 && (
            <motion.div
              {...contentVariants}
              transition={{ ...contentVariants.transition, delay: shouldReduce ? 0 : 0.7 }}
              className="mb-12"
            >
              <span className="label-gold block mb-5">Curator&apos;s Notes</span>
              <div className="space-y-4 border-l-[3px] border-gold/30 pl-4 py-1">
                {data.funFacts.map((fact, i) => (
                  <p key={i} className="text-text-secondary text-[15px] leading-[1.9] font-sans m-0">{fact}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Historical Record (Timeline) */}
          {data.timeline && data.timeline.length > 0 && (
            <motion.div
              {...contentVariants}
              transition={{ ...contentVariants.transition, delay: shouldReduce ? 0 : 0.9 }}
              className="mb-12 md:mb-16"
            >
              <span className="label-gold block mb-5">Historical Record</span>
              <div className="relative pl-6">
                {/* Vertical gold line */}
                <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-gold/20" />

                <div className="space-y-6">
                  {data.timeline.map((event, i) => (
                    <div key={i} className="relative">
                      {/* Dot on line */}
                      <div className="absolute -left-6 top-[7px] w-[5px] h-[5px] bg-gold rounded-full" style={{ transform: 'translateX(-2px)' }} />
                      <span className="text-gold font-sans text-xs uppercase tracking-widest font-semibold">{event.year}</span>
                      <p className="text-text-secondary text-[15px] mt-1 leading-[1.9] font-sans">{event.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Voice Controls - Mobile Bottom Fixed Bar */}
      {speech.supported && (
        <div className="voice-controls md:hidden">
          {!speech.isPlaying ? (
            <button onClick={handlePlay} className="text-gold font-sans text-[10px] uppercase tracking-widest font-medium active:opacity-50 flex items-center gap-2 py-3 px-6">
              <Play size={12} /> NARRATE
            </button>
          ) : (
            <>
              <button onClick={speech.isPaused ? speech.resume : speech.pause} className="text-gold font-sans text-[10px] uppercase tracking-widest font-medium active:opacity-50 flex items-center gap-2 py-3 px-6">
                {speech.isPaused ? <><Play size={12}/> RESUME</> : <><Pause size={12}/> PAUSE</>}
              </button>
              <button onClick={speech.stop} className="text-gold font-sans text-[10px] uppercase tracking-widest font-medium active:opacity-50 flex items-center gap-2 py-3 px-6">
                <Square size={12} /> STOP
              </button>
            </>
          )}
        </div>
      )}

      {/* API badge */}
      {usedAPI && (
        <div className="fixed bottom-[72px] md:bottom-4 left-6 z-40 label-gold opacity-30 hover:opacity-80 transition-opacity select-none">
          Powered by {usedAPI}
        </div>
      )}
    </motion.div>
  );
};

export default ExperienceScreen;
