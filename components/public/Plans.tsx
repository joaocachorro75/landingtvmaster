import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Check, Smartphone, Copy, X } from 'lucide-react';
import { THEME_CONFIG } from '../../constants';
import { generatePixPayload } from '../../utils/pixUtils';

const Plans: React.FC = () => {
  const { plans, content } = useAppContext();
  const theme = THEME_CONFIG[content.theme || 'blue'];
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleSubscribe = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const closePayment = () => {
    setSelectedPlanId(null);
  };

  const pixPayload = selectedPlan 
    ? generatePixPayload(content.pixKey, content.pixKeyType || 'cpf', content.logoText, "Online", selectedPlan.price) 
    : '';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    alert('Código Copia e Cola copiado!');
  };

  const handleSendProof = (planName: string, price: number) => {
    const message = encodeURIComponent(`Olá! Fiz o pagamento via PIX para o plano ${planName} (R$ ${price.toFixed(2)}). Segue o comprovante.`);
    window.open(`https://wa.me/${content.adminWhatsapp}?text=${message}`, '_blank');
  };

  return (
    <section id="planos" className={`py-24 relative ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos Flexíveis</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Escolha o melhor pacote para você e sua família. Liberação imediata após confirmação.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative backdrop-blur-sm border ${plan.recommended ? `${theme.border} shadow-2xl` : 'border-white/10'} ${theme.card} rounded-2xl p-8 flex flex-col transition hover:-translate-y-2`}
            >
              {plan.recommended && (
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${theme.button} ${theme.buttonTo} text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg`}>
                  Mais Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">R$ {plan.price.toFixed(2)}</span>
                <span className="text-slate-400 mb-1">/{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <Check className={`w-5 h-5 mr-3 shrink-0 ${theme.icon}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${plan.recommended ? 'bg-white text-black hover:bg-gray-100' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Contratar Agora
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal/Overlay */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`${theme.card} border ${theme.border} w-full max-w-md rounded-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]`}>
            <button onClick={closePayment} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">Pagamento Seguro</h3>
                <p className="text-slate-400">Plano {selectedPlan.name} - <span className="text-green-400 font-bold">R$ {selectedPlan.price.toFixed(2)}</span></p>
            </div>

            <div className="bg-white p-4 rounded-xl mb-6 mx-auto w-64 h-64 flex items-center justify-center">
                 {/* QR Code Image using public API based on generated payload */}
                 <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`}
                    alt="QR Code PIX"
                    className="w-full h-full object-contain"
                 />
            </div>

            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-slate-300 mb-2 font-semibold">Instruções:</p>
                    <ol className="text-xs text-slate-400 text-left list-decimal pl-8 space-y-1 mb-4">
                        <li>Abra o aplicativo do seu banco.</li>
                        <li>Escolha a opção <strong>PIX</strong> > <strong>Ler QR Code</strong>.</li>
                        <li>Aponte a câmera ou use a opção "PIX Copia e Cola" abaixo.</li>
                        <li>Confira o valor e confirme o pagamento.</li>
                        <li>Envie o comprovante no WhatsApp abaixo.</li>
                    </ol>
                </div>

                <div className="flex gap-2">
                    <input type="text" readOnly value={pixPayload} className="flex-1 bg-black/50 border border-slate-600 rounded px-3 py-2 text-xs text-slate-300 truncate" />
                    <button onClick={handleCopyPix} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
                        <Copy className="w-4 h-4" /> Copiar
                    </button>
                </div>

                <button 
                    onClick={() => handleSendProof(selectedPlan.name, selectedPlan.price)}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                >
                    <Smartphone className="w-5 h-5" />
                    Enviar Comprovante
                </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Plans;
