import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { PlayCircle, Zap, Briefcase } from 'lucide-react';
import { THEME_CONFIG } from '../../constants';

const Hero: React.FC = () => {
  const { content } = useAppContext();
  const theme = THEME_CONFIG[content.theme || 'blue'];

  const handleTestRequest = () => {
    const message = encodeURIComponent(`Olá! Gostaria de solicitar o teste grátis de 4 horas da ${content.logoText}.`);
    window.open(`https://wa.me/${content.salesWhatsapp}?text=${message}`, '_blank');
  };

  const handleResellerRequest = () => {
    // Uses Admin/Support number for Reseller inquiries or Sales depending on preference. Using Sales for consistency with "Contact".
    // Alternatively, use adminWhatsapp if it's strictly business. Let's stick to SalesWhatsapp for leads.
    const message = encodeURIComponent(`Olá! Tenho interesse em ser revendedor da ${content.logoText}. Gostaria de mais informações.`);
    window.open(`https://wa.me/${content.salesWhatsapp}?text=${message}`, '_blank');
  };

  const handleScrollToPlans = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${theme.bg}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={content.heroImage} 
          alt="Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${content.theme === 'red' ? 'from-neutral-950 via-neutral-950/80' : 'from-slate-900 via-slate-900/80'} to-transparent`}></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${content.theme === 'red' ? 'from-neutral-950/90' : 'from-slate-900/90'} via-transparent to-transparent`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm mb-8 animate-fade-in-down border ${theme.border} bg-white/5`}>
          <Zap className={`w-4 h-4 ${theme.icon}`} />
          <span className="text-gray-200 text-sm font-medium">Estabilidade Garantida</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-2xl">
          {content.heroTitle}
        </h1>
        
        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md">
          {content.heroSubtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
          <button 
            onClick={handleTestRequest}
            className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r ${theme.button} ${theme.buttonTo} hover:opacity-90 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2`}
          >
            <PlayCircle className="w-5 h-5" />
            Solicitar Teste Grátis
          </button>
          
          <button 
            onClick={handleScrollToPlans}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl transition flex items-center justify-center cursor-pointer"
          >
            Ver Planos
          </button>

          {content.enableReseller && (
            <button 
              onClick={handleResellerRequest}
              className="w-full sm:w-auto px-8 py-4 bg-yellow-600/80 hover:bg-yellow-600 backdrop-blur-sm text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg border border-yellow-500/30"
            >
              <Briefcase className="w-5 h-5" />
              Seja Revendedor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
