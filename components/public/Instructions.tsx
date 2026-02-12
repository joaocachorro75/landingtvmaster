import React from 'react';
import { Tv, MonitorPlay, Smartphone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { THEME_CONFIG } from '../../constants';

const Instructions: React.FC = () => {
  const { content } = useAppContext();
  const theme = THEME_CONFIG[content.theme || 'blue'];

  const iconMap: Record<string, React.ReactNode> = {
    'tv': <Tv className={`w-8 h-8 ${theme.icon}`} />,
    'monitor': <MonitorPlay className={`w-8 h-8 ${theme.icon}`} />,
    'smartphone': <Smartphone className={`w-8 h-8 ${theme.icon}`} />,
  };

  // Fallback to empty array if content.instructions is undefined (legacy data safety)
  const instructions = content.instructions || [];

  return (
    <section className={`py-24 ${content.theme === 'black' ? 'bg-zinc-950' : (content.theme === 'red' ? 'bg-neutral-900' : 'bg-slate-800')}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Configuração Simplificada</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Compatível com os principais aplicativos do mercado. Veja como é fácil começar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {instructions.map((app, idx) => (
            <div key={app.id || idx} className={`${theme.card} p-8 rounded-2xl border border-white/5 hover:border-white/10 transition`}>
              <div className={`mb-6 bg-black/40 w-16 h-16 rounded-xl flex items-center justify-center border border-white/5`}>
                {iconMap[app.iconKey] || iconMap['tv']}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{app.name}</h3>
              <ol className="space-y-4">
                {app.steps.map((step, stepIdx) => (
                  <li key={stepIdx} className="flex gap-3 text-slate-300 text-sm">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-black/40 ${theme.primary} flex items-center justify-center text-xs font-bold border border-white/10`}>
                      {stepIdx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instructions;
