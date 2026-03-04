'use client';

import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
          iconBg: 'bg-amber-100',
          button: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default: // danger
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          iconBg: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${styles.button}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
