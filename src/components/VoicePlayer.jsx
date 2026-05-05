import { Play, Pause, Square } from 'lucide-react';

const VoicePlayer = ({ isPlaying, isPaused, onPlay, onPause, onResume, onStop, supported }) => {
  if (!supported) {
    return null; // Don't show if speech synthesis isn't supported
  }

  return (
    <div className="flex items-center gap-4 bg-white/5 border border-gray-700 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        {!isPlaying && !isPaused ? (
          <button 
            onClick={onPlay}
            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
          >
            <Play size={18} fill="currentColor" className="ml-1" />
          </button>
        ) : (
          <>
            {isPaused ? (
              <button 
                onClick={onResume}
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
              >
                <Play size={18} fill="currentColor" className="ml-1" />
              </button>
            ) : (
              <button 
                onClick={onPause}
                className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-white rounded-full hover:bg-yellow-400 transition-colors"
              >
                <Pause size={18} fill="currentColor" />
              </button>
            )}
            <button 
              onClick={onStop}
              className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors"
            >
              <Square size={16} fill="currentColor" />
            </button>
          </>
        )}
      </div>

      {/* Animated Sound Wave */}
      <div className="flex-1 flex items-center justify-center h-8">
        {isPlaying && !isPaused ? (
          <div className="wave-container">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 uppercase tracking-widest">
            {isPaused ? 'Paused' : 'Ready'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoicePlayer;
