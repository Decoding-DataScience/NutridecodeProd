import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Scan as ScanIcon,
  Crown,
} from 'lucide-react';
import { analyzeFoodLabel, validateImage } from '../services/openai';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { submitWaitlistEntry } from '../services/supabase';
import Header from '../components/Header';

const Scan = () => {
  const [mode, setMode] = useState<'select' | 'camera' | 'upload' | 'preview' | 'processing'>('select');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heif': ['.heif']
    },
    maxSize: 10485760, // 10MB
    onDrop: handleFileDrop,
    onDropRejected: (rejections) => {
      setError(
        rejections[0]?.errors[0]?.code === 'file-too-large'
          ? 'File is too large. Maximum size is 10MB.'
          : 'Please upload a valid image file (JPG, PNG, or HEIF)'
      );
    },
  });

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'processing') {
      interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [mode]);

  async function handleFileDrop(acceptedFiles: File[]) {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (validateImage(result)) {
            setImagePreview(result);
            setMode('preview');
          } else {
            setError('Invalid image format or size. Please try another image.');
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Error reading file. Please try again.');
      }
    }
  }

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        
        // Use the actual video dimensions for better quality
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Failed to initialize canvas context');
          return;
        }

        // Draw the current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to JPEG with high quality
        const image = canvas.toDataURL('image/jpeg', 0.95);
        
        // Validate the captured image
        if (validateImage(image)) {
          setImagePreview(image);
          stopCamera();
          setMode('preview');
          setError(null);
        } else {
          setError('Failed to capture image. Please try again.');
        }
      } catch (err) {
        console.error('Error capturing image:', err);
        setError('Failed to capture image. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!imagePreview) return;

    setLoading(true);
    setMode('processing');
    setError(null);
    
    try {
      const analysis = await analyzeFoodLabel(imagePreview);
      navigate('/results', { state: { analysis, imageUrl: imagePreview } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
      setMode('preview');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setImagePreview(null);
    setError(null);
    setMode('select');
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <Header />
      
      {/* Progress Bar */}
      {(mode === 'camera' || mode === 'preview' || mode === 'processing') && (
        <div className="fixed top-16 left-0 right-0 h-1 bg-gray-100 z-40">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ 
              width: mode === 'processing' ? '100%' : '0%',
            }}
            transition={{ duration: 2 }}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-24">
        <div className="max-w-2xl mx-auto px-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              {mode === 'select' && (
                <div className="p-8 space-y-8">
                  <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Scan Food Label
                    </h1>
                    <p className="text-gray-600">
                      Choose how you'd like to capture the food label for analysis
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <motion.button
                        className="w-full flex flex-col items-center p-8 border-2 border-dashed rounded-xl bg-gray-50 opacity-75 cursor-not-allowed"
                        disabled
                      >
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="font-medium text-lg text-gray-400">Take Photo</span>
                        <span className="text-sm text-gray-400 mt-2 text-center">
                          Use your device's camera to capture the label
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-primary/95 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg transform rotate-12">
                            <Crown className="w-4 h-4" />
                            <span className="font-medium">Premium Feature</span>
                          </div>
                        </div>
                      </motion.button>
                    </div>

                    <div
                      {...getRootProps()}
                      className={`flex flex-col items-center p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer group
                        ${isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary hover:bg-primary/5'}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-full flex flex-col items-center"
                      >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <span className="font-medium text-lg">Upload Image</span>
                        <span className="text-sm text-gray-500 mt-2 text-center">
                          Select an image from your device
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'camera' && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-[600px] object-cover"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="border-2 border-primary m-8 rounded-lg">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white text-shadow">
                        <p>Position the food label within the frame</p>
                      </div>
                    </div>
                  </motion.div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        stopCamera();
                        setMode('select');
                      }}
                      className="p-4 bg-white rounded-full shadow-lg"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={captureImage}
                      className="p-4 bg-primary rounded-full shadow-lg"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </motion.button>
                  </div>
                </div>
              )}

              {mode === 'preview' && imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-[600px] object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={resetScan}
                      className="p-4 bg-white rounded-full shadow-lg"
                      disabled={loading}
                    >
                      <RotateCcw className="w-6 h-6 text-gray-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSubmit}
                      className="p-4 bg-primary rounded-full shadow-lg"
                      disabled={loading}
                    >
                      <Check className="w-6 h-6 text-white" />
                    </motion.button>
                  </div>
                </div>
              )}

              {mode === 'processing' && (
                <div className="p-8 space-y-8">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-12 h-12 text-primary" />
                    </motion.div>
                    <h2 className="text-xl font-semibold mt-4">Analyzing Image</h2>
                    <p className="text-gray-600 text-center mt-2">
                      Our AI is processing your food label
                    </p>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      className="bg-primary h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${processingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    {processingProgress < 100 ? 'Please wait...' : 'Almost done!'}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Scan;