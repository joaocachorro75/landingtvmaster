import React, { useState } from 'react';
import { 
  Zap, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Headphones, 
  Shield, 
  Bot,
  PlayCircle,
  Star,
  Menu,
  X
} from 'lucide-react';

interface SaasLandingProps {
  onCheckout: (plan: 'basico' | 'premium') => void;
  onLogin: () => void;
}

const SaasLanding: React.FC<SaasLandingProps> = ({ onCheckout, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const plans = [
    {
      id: 'basico',
      name: 'Básico',
      price: 9.99,
      period: 'mês',
      features: [
        'Site personalizado com sua marca',
        'Gerenciamento de clientes',
        'Página de vendas profissional',
        'Domínio personalizado',
        'Suporte por WhatsApp',
      ],
      recommended: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.00,
      period: 'mês',
      features: [
        'Tudo do plano Básico',
        'Funcionário IA incluso',
        'Atendimento automático 24/7',
        'Envio automático de lembretes',
        'Gestão de pagamentos integrada',
        'Relatórios detalhados',
        'Suporte prioritário',
      ],
      recommended: true,
    },
  ];

  const faqs = [
    {
      question: 'O que é o Funcionário IA?',
      answer: 'É um assistente virtual que atende seus clientes automaticamente pelo WhatsApp, responde dúvidas comuns, envia lembretes de pagamento e muito mais. Funciona 24 horas por dia, 7 dias por semana.',
    },
    {
      question: 'Quanto tempo leva para configurar?',
      answer: 'Após o pagamento, seu site fica pronto em poucos minutos. Você recebe os dados de acesso por WhatsApp e pode começar a personalizar imediatamente.',
    },
    {
      question: 'Posso usar meu próprio domínio?',
      answer: 'Sim! Nos dois planos você pode configurar um domínio personalizado (ex: minharevenda.com.br). Também fornecemos um subdomínio gratuito.',
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Aceitamos PIX para pagamento à vista. Você pode pagar mensalmente ou contratar planos mais longos com desconto.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, não há multa nem fidelidade. Você pode cancelar quando quiser e continua tendo acesso até o fim do período pago.',
    },
    {
      question: 'Tenho suporte se tiver dúvidas?',
      answer: 'Claro! No plano Básico você tem suporte por WhatsApp. No Premium, o suporte é prioritário e você ainda conta com o Funcionário IA.',
    },
  ];

  const benefits = [
    {
      icon: Globe,
      title: 'Site Profissional',
      description: 'Landing page moderna e otimizada para conversão com sua marca e cores.',
    },
    {
      icon: Headphones,
      title: 'Suporte Humanizado',
      description: 'Equipe pronta para ajudar você a crescer seu negócio.',
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados e de seus clientes protegidos com criptografia.',
    },
    {
      icon: Bot,
      title: 'Automatize Vendas',
      description: 'Com o Funcionário IA, você vende até dormindo.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-violet-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
              <Globe className="w-6 h-6 text-violet-400" />
              <span className="font-bold text-xl tracking-wider">Revendas TV</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('beneficios')} className="hover:text-violet-400 transition">Benefícios</button>
              <button onClick={() => scrollToSection('planos')} className="hover:text-violet-400 transition">Planos</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-violet-400 transition">FAQ</button>
              <button 
                onClick={onLogin}
                className="text-violet-400 hover:text-violet-300 transition"
              >
                Já sou cliente
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 pb-4">
            <button onClick={() => scrollToSection('beneficios')} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium">Benefícios</button>
            <button onClick={() => scrollToSection('planos')} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium">Planos</button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium">FAQ</button>
            <button onClick={onLogin} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium text-violet-400">Já sou cliente</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-600/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-600/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm mb-8 border border-violet-500/30 bg-violet-500/10">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-violet-300 text-sm font-medium">Comece sua revenda hoje</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6">
            Venda sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">TV via Internet</span><br />
            de forma simples
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Tenha seu próprio site de vendas, gerencie clientes e automatize seu negócio. 
            Tudo em uma única plataforma feita para você lucrar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => scrollToSection('planos')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transform transition hover:scale-105 flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Começar Agora
            </button>
            
            <button 
              onClick={() => scrollToSection('beneficios')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl transition"
            >
              Saiba Mais
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-violet-400">500+</div>
              <div className="text-sm text-slate-400">Revendedores ativos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-violet-400">24/7</div>
              <div className="text-sm text-slate-400">Funcionário IA</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-violet-400">R$9,99</div>
              <div className="text-sm text-slate-400">A partir de/mês</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Por que escolher o Revendas TV?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar e expandir seu negócio de TV via internet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className="bg-slate-800/50 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6 hover:border-violet-500/40 transition group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-24 relative bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Escolha seu Plano
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comece com o plano Básico e evolua para o Premium quando quiser automatizar tudo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative backdrop-blur-sm border rounded-2xl p-8 flex flex-col transition hover:-translate-y-2 ${
                  plan.recommended 
                    ? 'border-violet-500 shadow-2xl shadow-violet-500/20 bg-slate-800/80' 
                    : 'border-white/10 bg-slate-800/50'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Mais Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-slate-400 mb-1">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-slate-300 text-sm">
                      <Check className="w-5 h-5 mr-3 shrink-0 text-violet-400 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => onCheckout(plan.id as 'basico' | 'premium')}
                  className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                    plan.recommended 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {plan.recommended ? 'Começar com Premium' : 'Começar com Básico'}
                </button>
              </div>
            ))}
          </div>

          {/* Funcionário IA Highlight */}
          <div className="mt-16 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">Funcionário IA incluso no Premium</h3>
                <p className="text-slate-300">
                  Um assistente virtual que atende seus clientes pelo WhatsApp automaticamente, 
                  envia lembretes de pagamento, responde dúvidas e muito mais. Funciona 24 horas por dia!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-slate-400">
              Tire suas dúvidas sobre nossa plataforma.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-slate-800/50 border border-violet-500/20 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition"
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-violet-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-slate-300 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 md:p-12 shadow-2xl shadow-violet-500/25">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-violet-100 mb-8 max-w-xl mx-auto">
              Junte-se a centenas de revendedores que já estão lucrando com nossa plataforma.
            </p>
            <button 
              onClick={() => scrollToSection('planos')}
              className="px-8 py-4 bg-white text-violet-600 font-bold rounded-xl shadow-lg hover:bg-violet-50 transition transform hover:scale-105"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-violet-500/20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} <span className="text-slate-300 font-semibold">Revendas TV</span>. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Desenvolvido por <a href="https://to-ligado.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-bold transition">To-Ligado.com</a>
          </p>
          <button 
            onClick={onLogin}
            className="mt-4 text-violet-500 hover:text-violet-400 text-xs underline"
          >
            Acesso Cliente
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SaasLanding;
