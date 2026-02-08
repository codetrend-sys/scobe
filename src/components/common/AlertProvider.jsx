import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 items-end">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded shadow-lg text-white border ${
            t.type === 'success' ? 'bg-emerald-600 border-emerald-700' : t.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-gray-800 border-gray-700'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 text-sm">{t.message}</div>
              <button onClick={() => removeToast(t.id)} className="opacity-80 hover:opacity-100">✕</button>
            </div>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export default AlertProvider;
