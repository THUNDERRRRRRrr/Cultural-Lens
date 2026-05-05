import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Sparkles, ArrowLeft } from 'lucide-react';

const CaptureScreen = ({ mode, onBack, onDiscover }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  // Handle Drag & Drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (stream) stopCamera();
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Camera handling
  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please make sure you've granted permissions.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  function captureImage() {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      handleFileSelect(file);
    }, "image/jpeg", 0.9);
  };

  React.useEffect(() => {
    if (mode === 'camera') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleDiscover = () => {
    if (selectedFile) {
      onDiscover(selectedFile, previewUrl);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background p-6 flex flex-col"
    >
      <button 
        onClick={() => { stopCamera(); onBack(); }}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 self-start transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          {mode === 'upload' ? 'Upload an Image' : 'Capture the Moment'}
        </h2>

        {/* Upload Area */}
        {!stream && !previewUrl && (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full max-w-xl aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
              isDragging ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(124,58,237,0.3)]' : 'border-gray-600 bg-white/5 hover:border-gray-400'
            }`}
          >
            <ImageIcon size={48} className="text-gray-400" />
            <p className="text-gray-300">Drag and drop your image here, or</p>
            <label className="px-6 py-2 bg-primary/20 hover:bg-primary/40 border border-primary text-white rounded-full cursor-pointer transition-colors backdrop-blur-sm">
              Browse Files
              <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
            </label>
          </div>
        )}

        {/* Camera Preview */}
        {stream && !previewUrl && (
          <div className="w-full max-w-xl aspect-video rounded-2xl overflow-hidden relative border border-gray-700 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button 
                onClick={captureImage}
                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform"
              />
            </div>
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div className="w-full max-w-xl flex flex-col items-center gap-8">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-primary shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/50" />
              <button 
                onClick={() => { setPreviewUrl(null); setSelectedFile(null); if(mode==='camera') startCamera(); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <Upload size={16} />
              </button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 58, 237, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscover}
              className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full text-lg shadow-lg"
            >
              <Sparkles size={24} />
              Discover Story
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CaptureScreen;
