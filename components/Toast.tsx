import React, { useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const baseClasses = "fixed top-5 right-5 z-[100] max-w-sm w-full p-4 rounded-md shadow-lg flex items-center gap-3";
  const typeClasses = {
    success: 'bg-green-100 border border-green-400 text-green-800',
    error: 'bg-red-100 border border-red-400 text-red-800',
  };

  const Icon = () => {
      if (type === 'success') {
          return (
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          );
      }
      return (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      );
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]} animate-slide-in-right`} role="alert">
        <Icon />
        <p className="font-sans-display font-semibold text-sm flex-grow">{message}</p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 transition-colors">
            <CloseIcon className="w-4 h-4" />
        </button>
        <style>{`
            @keyframes slide-in-right {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default Toast;
