import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, User, Phone, AlertCircle } from 'lucide-react';
import { THEME_CONFIG } from '../../constants';

const LeadCapture: React.FC = () => {
  const { addLead, content } = useAppContext();
  const theme = THEME_CONFIG[content.theme || 'blue'];
  
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name && whatsapp) {
      const success = addLead({ name, whatsapp });
      if (success) {
        setSubmitted(true);
        setName('');
        setWhatsapp('');
      } else {
        setError('Este número de WhatsApp já foi cadastrado.');
      }
    }
  };

  return (
    <section className={`py-24 ${theme.bg}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${theme.card} backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${theme.buttonSolid} opacity-10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none`}></div>
          <div className={`absolute bottom-0 left-0 w-64 h-64 ${theme.buttonSolid} opacity-10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none`}></div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Quer novidades e ofertas exclusivas?</h2>
            <p className="text-slate-300 mb-8">Deixe seu contato para receber promoções relâmpago e atualizações sobre novos conteúdos.</p>

            {submitted ? (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-green-200 animate-fade-in">
                <p className="font-bold text-lg">Cadastro realizado com sucesso!</p>
                <p className="text-sm mt-2">Em breve entraremos em contato.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-green-400 hover:text-green-300 underline text-sm">
                  Cadastrar outro
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo"
                    className="block w-full pl-10 pr-3 py-4 border border-slate-700 rounded-xl leading-5 bg-black/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition sm:text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Seu WhatsApp (ex: +55 11 99999-9999)"
                    className="block w-full pl-10 pr-3 py-4 border border-slate-700 rounded-xl leading-5 bg-black/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition sm:text-sm"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r ${theme.button} ${theme.buttonTo} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition shadow-lg`}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Receber Ofertas
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadCapture;
