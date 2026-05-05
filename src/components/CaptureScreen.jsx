import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Sparkles, ArrowLeft, Camera, RefreshCw, SwitchCamera } from 'lucide-react';

const CaptureScreen = ({ mode, onBack, onDiscover }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stream, setStream] = useState(null);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const videoRef = useRef(null);

  // ─── File handling ─────────────────────────────────────────────────────────

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (stream) stopCamera();
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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

  // ─── Live camera (getUserMedia) — works on desktop + HTTPS ─────────────────

  async function startLiveCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return; // silently fail — native input is the primary path
    }

    const constraints = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true }
    ];

    let mediaStream = null;
    for (const constraint of constraints) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
        break;
      } catch {
        // try the next constraint
      }
    }

    if (!mediaStream) return;

    setStream(mediaStream);
    setShowLiveCamera(true);
    setSelectedFile(null);
    setPreviewUrl(null);

    const assignStream = () => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    };
    assignStream();
    setTimeout(assignStream, 150);
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowLiveCamera(false);
  }

  function captureFrame() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || video.clientWidth || 640;
    const h = video.videoHeight || video.clientHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      handleFileSelect(file);
    }, "image/jpeg", 0.9);
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleDiscover = () => {
    if (selectedFile) {
      onDiscover(selectedFile, previewUrl);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

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

        {/* ───────── UPLOAD MODE ───────── */}
        {mode === 'upload' && !previewUrl && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full max-w-xl aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
              isDragging
                ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(124,58,237,0.3)]'
                : 'border-gray-600 bg-white/5 hover:border-gray-400'
            }`}
          >
            <ImageIcon size={48} className="text-gray-400" />
            <p className="text-gray-300 text-center px-4">Drag and drop your image here, or</p>
            <label className="px-6 py-2.5 bg-primary/20 hover:bg-primary/40 border border-primary text-white rounded-full cursor-pointer transition-colors backdrop-blur-sm">
              Browse Files
              <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
            </label>
          </div>
        )}

        {/* ───────── CAMERA MODE (no live viewfinder yet) ───────── */}
        {mode === 'camera' && !previewUrl && !showLiveCamera && (
          <div className="w-full max-w-xl flex flex-col items-center gap-6">
            {/* Big native camera button — works on every phone */}
            <div className="w-full aspect-[4/3] border-2 border-dashed border-secondary/40 rounded-2xl flex flex-col items-center justify-center gap-5 bg-secondary/5 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center">
                <Camera size={36} className="text-secondary" />
              </div>
              <p className="text-gray-300 text-center px-6">
                Tap below to open your camera and take a photo
              </p>
              <label className="flex items-center gap-2 px-8 py-3.5 bg-secondary/20 hover:bg-secondary/40 border border-secondary text-white rounded-full cursor-pointer transition-colors text-lg font-medium active:scale-95">
                <Camera size={22} />
                Take Photo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInput}
                />
              </label>
            </div>

            {/* Secondary options row */}
            <div className="flex gap-3 w-full max-w-sm">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-gray-600 text-gray-300 rounded-full cursor-pointer transition-colors text-sm">
                <Upload size={16} />
                From Gallery
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileInput}
                />
              </label>
              <button
                onClick={() => startLiveCamera()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-gray-600 text-gray-300 rounded-full transition-colors text-sm"
              >
                <SwitchCamera size={16} />
                Live Camera
              </button>
            </div>
          </div>
        )}

        {/* ───────── LIVE CAMERA VIEWFINDER ───────── */}
        {showLiveCamera && !previewUrl && (
          <div className="w-full max-w-xl rounded-2xl overflow-hidden relative border border-gray-700 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto min-h-[280px] object-cover bg-black"
            />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 items-center">
              {/* Native fallback */}
              <label className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors">
                <Upload size={16} className="text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInput}
                />
              </label>
              {/* Main capture button */}
              <button
                onClick={captureFrame}
                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-90 transition-transform"
              />
              {/* Close live camera */}
              <button
                onClick={stopCamera}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <RefreshCw size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ───────── IMAGE PREVIEW ───────── */}
        {previewUrl && (
          <div className="w-full max-w-xl flex flex-col items-center gap-8">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-primary shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/50" />
              <button
                onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <RefreshCw size={16} />
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
