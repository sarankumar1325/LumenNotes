import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Image } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastContextType {
  showToast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-500" />,
    error: <AlertCircle size={16} className="text-red-500" />,
    info: <Info size={16} className="text-blue-500" />,
    warning: <AlertCircle size={16} className="text-amber-500" />
  };

  const bgColors = {
    success: 'bg-[#1C1917] border-l-4 border-emerald-500',
    error: 'bg-[#1C1917] border-l-4 border-red-500',
    info: 'bg-[#1C1917] border-l-4 border-blue-500',
    warning: 'bg-[#1C1917] border-l-4 border-amber-500'
  };

  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-sm shadow-lg ${bgColors[toast.type]} animate-[slideIn_0.3s_ease-out]`}
      style={{ minWidth: '200px' }}
    >
      {icons[toast.type]}
      <span className="text-white text-sm font-ui">{toast.message}</span>
      <button 
        onClick={onClose}
        className="ml-auto text-gray-400 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }].slice(-3));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
