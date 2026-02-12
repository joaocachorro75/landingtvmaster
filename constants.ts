import { Plan, SiteContent, ThemeOption } from './types';

export const INITIAL_CONTENT: SiteContent = {
  heroTitle: "O Futuro da TV Chegou na Sua Casa",
  heroSubtitle: "Assista a milhares de conteúdos com qualidade 4K sem travamentos. Filmes, séries e canais ao vivo em qualquer dispositivo.",
  heroImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop", // Cyberpunk/Tech vibe
  logoText: "ULTRA STREAM",
  logoImage: "", // Start empty
  pixKey: "000.000.000-00", // Default dummy
  pixKeyType: "cpf",
  adminWhatsapp: "5511999999999", // Default dummy
  salesWhatsapp: "5511999999999", // Default dummy
  theme: 'blue',
  // SEO & Footer
  footerText: "ULTRA STREAM",
  seoTitle: "UltraStream - TV via Internet 4K Sem Travamentos",
  seoDescription: "Assista aos melhores filmes, séries e canais ao vivo. Solicite seu teste grátis agora mesmo!",
  seoImage: "",
  // New Fields
  enableReseller: false,
  instructions: [
    {
      id: '1',
      name: "XCIPTV",
      iconKey: 'tv',
      steps: [
        "Baixe o XCIPTV na loja de aplicativos da sua TV ou Box.",
        "Abra o aplicativo e insira a URL que enviaremos.",
        "Coloque seu Usuário e Senha.",
        "Clique em Entrar e aguarde carregar."
      ]
    },
    {
      id: '2',
      name: "IPTV Smarters",
      iconKey: 'monitor',
      steps: [
        "Instale o IPTV Smarters Pro.",
        "Selecione 'Entrar com Xtream Codes API'.",
        "Preencha qualquer nome, seu usuário, senha e a URL.",
        "Clique em 'Add User'."
      ]
    },
    {
      id: '3',
      name: "XCloud / Web",
      iconKey: 'smartphone',
      steps: [
        "Acesse o navegador da sua TV ou Celular.",
        "Digite o link do nosso Web Player.",
        "Insira suas credenciais de acesso.",
        "Desfrute de todo conteúdo sem instalar nada."
      ]
    }
  ]
};

export const INITIAL_PLANS: Plan[] = [
  {
    id: '1',
    name: 'Mensal',
    price: 35.00,
    period: 'mês',
    features: ['1 Tela', 'Conteúdo 4K/FHD', 'Sem travamentos', 'Suporte 24/7', 'Canais + Filmes + Séries'],
    recommended: false,
  },
  {
    id: '2',
    name: 'Trimestral',
    price: 90.00,
    period: '3 meses',
    features: ['1 Tela', 'Conteúdo 4K/FHD', 'Economia de R$ 15,00', 'Suporte Prioritário', 'Canais + Filmes + Séries'],
    recommended: true,
  },
  {
    id: '3',
    name: 'Semestral',
    price: 160.00,
    period: '6 meses',
    features: ['2 Telas', 'Conteúdo 4K/FHD', 'Economia de R$ 50,00', 'Suporte VIP', 'Canais + Filmes + Séries'],
    recommended: false,
  },
];

export const THEME_CONFIG: Record<ThemeOption, {
  name: string;
  primary: string; // Used for text highlight
  button: string; // Button gradient start
  buttonTo: string; // Button gradient end
  buttonSolid: string; // Solid button color
  bg: string; // Main background
  nav: string; // Nav background
  card: string; // Card background
  border: string; // Border accent
  icon: string; // Icon color
}> = {
  blue: {
    name: 'Azul Tecnológico',
    primary: 'text-violet-400',
    button: 'from-violet-600',
    buttonTo: 'to-indigo-600',
    buttonSolid: 'bg-violet-600',
    bg: 'bg-slate-900',
    nav: 'bg-slate-900/90',
    card: 'bg-slate-800/50',
    border: 'border-violet-500',
    icon: 'text-violet-400',
  },
  red: {
    name: 'Vermelho Vibrante',
    primary: 'text-red-500',
    button: 'from-red-600',
    buttonTo: 'to-rose-800',
    buttonSolid: 'bg-red-700',
    bg: 'bg-neutral-950',
    nav: 'bg-neutral-950/90',
    card: 'bg-neutral-900/50',
    border: 'border-red-600',
    icon: 'text-red-500',
  },
  black: {
    name: 'Preto Premium',
    primary: 'text-white',
    button: 'from-zinc-700',
    buttonTo: 'to-black',
    buttonSolid: 'bg-zinc-800',
    bg: 'bg-black',
    nav: 'bg-black/90',
    card: 'bg-zinc-900/50',
    border: 'border-white/20',
    icon: 'text-white',
  }
};
