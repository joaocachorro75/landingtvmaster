import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  CreditCard,
  ArrowLeft,
  Loader2,
  Bot,
  Star
} from 'lucide-react';

interface SaasCheckoutProps {
  plan: 'basico' | 'premium';
  onBack: () => void;
  onComplete: (data: { name: string; email: string; whatsapp: string }) => void;
}

const SaasCheckout: React.FC<SaasCheckoutProps> = ({ plan, onBack, onComplete }) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [copied, setCopied] = useState(false);

  const planDetails = {
    basico: {
      name: 'Básico',
      price: 9.99,
      features: ['Site personalizado', 'Gerenciamento de clientes', 'Suporte WhatsApp'],
    },
    premium: {
      name: 'Premium',
      price: 99.00,
      features: ['Tudo do Básico', 'Funcionário IA', 'Suporte prioritário'],
    },
  };

  const currentPlan = planDetails[plan];

  const formatWhatsapp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStep('payment');
    setLoading(false);
  };

  const generatePixPayload = () => {
    // Payload PIX simplificado para demonstração
    // Em produção, usar biblioteca oficial ou API do banco
    const pixKey = 'revendas@to-ligado.com';
    const amount = currentPlan.price.toFixed(2);
    const txId = `REV${Date.now()}`;
    
    // Payload básico (simplificado)
    return `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${amount}5802BR5925REVENDAS TV SAAS6009SAO PAULO62070503***6304`;
  };

  const pixPayload = generatePixPayload();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    
    // Simular confirmação
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep('success');
    setLoading(false);
    
    // Notificar completion após mostrar sucesso
    setTimeout(() => {
      onComplete(formData);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        {step !== 'success' && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        )}

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Form Step */}
          {step === 'form' && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Finalizar Compra</h2>
                    <p className="text-violet-200 text-sm">Plano {currentPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      R$ {currentPlan.price.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-violet-200 text-xs">por mês</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatWhatsapp(e.target.value) })}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                    placeholder="(00) 00000-0000"
                    maxLength={16}
                  />
                </div>

                {/* Plan Summary */}
                <div className="bg-slate-900/50 rounded-lg p-4 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    {plan === 'premium' && <Star className="w-4 h-4 text-yellow-400" />}
                    <span className="font-medium text-white">Resumo do pedido</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Plano {currentPlan.name}</span>
                      <span>R$ {currentPlan.price.toFixed(2).replace('.', ',')}/mês</span>
                    </div>
                    {plan === 'premium' && (
                      <div className="flex items-center gap-2 text-violet-400">
                        <Bot className="w-4 h-4" />
                        <span>Funcionário IA incluso</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Continuar para Pagamento
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-center">
                <h2 className="text-xl font-bold text-white mb-1">Pagamento via PIX</h2>
                <p className="text-violet-200 text-sm">
                  Plano {currentPlan.name} - R$ {currentPlan.price.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="p-6">
                {/* QR Code */}
                <div className="bg-white rounded-xl p-4 mb-6 mx-auto w-64 h-64 flex items-center justify-center">
                  <img 
                    src={qrCodeUrl}
                    alt="QR Code PIX"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Instructions */}
                <div className="text-center mb-6">
                  <p className="text-sm text-slate-300 mb-4">
                    Escaneie o QR Code ou use o código Copia e Cola abaixo:
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixPayload}
                      className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300 truncate"
                    />
                    <button
                      onClick={handleCopyPix}
                      className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                        copied 
                          ? 'bg-green-600 text-white' 
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instructions List */}
                <ol className="text-xs text-slate-400 space-y-2 mb-6 pl-4">
                  <li className="flex gap-2">
                    <span className="text-violet-400 font-bold">1.</span>
                    Abra o app do seu banco
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 font-bold">2.</span>
                    Escolha PIX → Escanear QR Code ou Copia e Cola
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 font-bold">3.</span>
                    Confirme o pagamento
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 font-bold">4.</span>
                    Clique em "Já paguei" abaixo
                  </li>
                </ol>

                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Já paguei
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Você receberá os dados de acesso por WhatsApp em instantes
                </p>
              </div>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
              <p className="text-slate-300 mb-4">
                Obrigado por escolher o Revendas TV!
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 text-sm text-slate-300">
                <p className="mb-2">📱 Você receberá uma mensagem no WhatsApp com:</p>
                <ul className="text-left space-y-1">
                  <li>• Seus dados de acesso</li>
                  <li>• Link do seu site personalizado</li>
                  {plan === 'premium' && <li>• Informações do Funcionário IA</li>}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Security Badge */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-xs">
            <Smartphone className="w-4 h-4" />
            Pagamento 100% seguro via PIX
          </div>
        )}
      </div>
    </div>
  );
};

export default SaasCheckout;
