export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  recommended?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  date: string;
}

export interface AppInstruction {
  id: string;
  name: string;
  iconKey: 'tv' | 'monitor' | 'smartphone';
  steps: string[];
}

export type ThemeOption = 'blue' | 'red' | 'black';
export type AppView = 'landing' | 'admin';
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string; // Base64 or URL
  logoText: string;
  logoImage: string; // Base64 Logo
  pixKey: string;
  pixKeyType: PixKeyType;
  adminWhatsapp: string; // For support and proof
  salesWhatsapp: string; // For tests
  theme: ThemeOption;
  // SEO & Footer
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  // New Fields
  enableReseller: boolean;
  instructions: AppInstruction[];
}

export interface AppContextType {
  plans: Plan[];
  leads: Lead[];
  content: SiteContent;
  isLoggedIn: boolean;
  currentView: AppView;
  setView: (view: AppView) => void;
  login: () => void;
  logout: () => void;
  updateContent: (newContent: Partial<SiteContent>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  addPlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  addLead: (lead: Omit<Lead, 'id' | 'date'>) => boolean;
  updateLead: (id: string, data: Partial<Lead>) => boolean;
  deleteLead: (id: string) => void;
}
