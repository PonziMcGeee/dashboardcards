import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  function dismiss(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 pl-3 pr-2 py-2.5 rounded-xl border border-gray-200 bg-white shadow-lg text-sm font-medium text-gray-800 pointer-events-auto toast-enter"
          >
            <CheckCircle size={15} className="text-green-500 shrink-0" />
            {t.message}
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
