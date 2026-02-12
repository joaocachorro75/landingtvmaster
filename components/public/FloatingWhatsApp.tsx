import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const FloatingWhatsApp: React.FC = () => {
  const { content } = useAppContext();

  const handleClick = () => {
    window.open(`https://wa.me/${content.salesWhatsapp}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-green-500/40 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute right-full mr-3 bg-white text-slate-800 px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
        Fale Conosco
      </span>
    </button>
  );
};

export default FloatingWhatsApp;
