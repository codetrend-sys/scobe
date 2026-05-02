import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

const AlertContext = createContext(null);

export function useAlert() {
  return useContext(AlertContext);
}

let idCounter = 0;

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', ttl = 4000) => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    if (ttl > 0) setTimeout(() => removeToast(id), ttl);
    return id;
  }, [removeToast]);

  const showSuccess = useCallback((msg, ttl) => show(msg, 'success', ttl), [show]);
  const showError = useCallback((msg, ttl) => show(msg, 'error', ttl), [show]);
  const showInfo = useCallback((msg, ttl) => show(msg, 'info', ttl), [show]);

  return (
    <AlertContext.Provider value={{ show, showSuccess, showError, showInfo }}>
      {children}

      {/* Toast container */}
      <div className="fixed right-4 bottom-4 z-[110] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`pointer-events-auto max-w-sm w-full px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-right-full duration-300 ${
              t.type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                : t.type === 'error' 
                ? 'bg-red-500/90 border-red-400 text-white' 
                : 'bg-gray-900/90 border-gray-700 text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 text-sm font-bold tracking-tight">{t.message}</div>
              <button 
                onClick={() => removeToast(t.id)} 
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export default AlertProvider;
