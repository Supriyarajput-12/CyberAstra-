import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#181c24] text-[#dfe2ee] rounded-lg border border-[#adc6ff]/40 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
      <span className="material-symbols-outlined text-[#4edea3] text-lg">check_circle</span>
      <span className="font-mono-sm">{message}</span>
      <button
        onClick={onClose}
        className="text-[#8c909f] hover:text-[#dfe2ee] p-1 ml-2 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};
