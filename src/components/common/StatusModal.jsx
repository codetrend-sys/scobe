import React from 'react';
import { X, AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

export default function StatusModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning', // 'warning', 'success', 'danger', 'info'
  confirmText = 'Confirmer',
  cancelText = 'Annuler'
}) {
  if (!isOpen) return null;

  const themes = {
    warning: {
      icon: <HelpCircle className="w-12 h-12 text-amber-500" />,
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    danger: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      button: 'bg-red-500 hover:bg-red-600 shadow-red-200',
      bg: 'bg-red-50',
      border: 'border-red-100'
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    }
  };

  const theme = themes[type] || themes.warning;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div className={`mb-6 p-4 rounded-2xl ${theme.bg} ${theme.border} border-2`}>
              {theme.icon}
            </div>

            <h3 className="mb-2 text-2xl font-black text-gray-900 tracking-tight">
              {title}
            </h3>
            <p className="text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 text-sm font-bold text-white rounded-2xl transition-all shadow-lg active:scale-95 ${theme.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
