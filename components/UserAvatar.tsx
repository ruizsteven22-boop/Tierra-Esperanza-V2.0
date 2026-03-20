'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, User, Check } from 'lucide-react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';

interface UserAvatarProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function UserAvatar({ value, onChange, className = '' }: UserAvatarProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
      onChange(imageSrc);
      setIsCameraOpen(false);
    }
  }, [webcamRef, onChange]);

  const removeImage = () => {
    setPreview(null);
    onChange('');
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center relative">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-slate-300" />
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white rounded-full text-slate-700 hover:bg-emerald-500 hover:text-white transition-all"
              title="Subir foto"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="p-2 bg-white rounded-full text-slate-700 hover:bg-emerald-500 hover:text-white transition-all"
              title="Tomar foto"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {preview && (
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-1 -right-1 p-1.5 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1"
        >
          <Upload className="w-3 h-3" /> Subir
        </button>
        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1"
        >
          <Camera className="w-3 h-3" /> Cámara
        </button>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Capturar Foto
                </h3>
                <button 
                  onClick={() => setIsCameraOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-2 border-dashed border-white/50" />
                </div>
              </div>

              <div className="p-8 flex justify-center gap-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(false)}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={capture}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Capturar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
