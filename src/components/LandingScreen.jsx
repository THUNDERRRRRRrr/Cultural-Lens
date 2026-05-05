import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera } from 'lucide-react';

const LandingScreen = ({ onNavigate }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${Math.random() * 10 + 10}s`
      }))
    );
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Background Particles - controlled by CSS */}
      <div className="particles-container">
        {particles.map((style, i) => (
          <div
            key={i}
            className="particle"
            style={style}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-2xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Cultural Lens
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12">
          Point. Discover. Experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('upload')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary/20 border border-primary text-white rounded-full backdrop-blur-sm transition-colors hover:bg-primary/40 text-lg font-medium"
          >
            <Upload size={24} />
            Upload Photo
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('camera')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-secondary/20 border border-secondary text-white rounded-full backdrop-blur-sm transition-colors hover:bg-secondary/40 text-lg font-medium"
          >
            <Camera size={24} />
            Use Camera
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
