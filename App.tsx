import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Hero from './components/public/Hero';
import Plans from './components/public/Plans';
import Instructions from './components/public/Instructions';
import LeadCapture from './components/public/LeadCapture';
import FloatingWhatsApp from './components/public/FloatingWhatsApp';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { Menu, X, Globe } from 'lucide-react';
import { THEME_CONFIG } from './constants';

const AppContent: React.FC = () => {
  const { isLoggedIn, content, currentView, setView } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const theme = THEME_CONFIG[content.theme || 'blue'];

  // --- SEO DYNAMIC UPDATES ---
  useEffect(() => {
    // Update Title
    document.title = content.seoTitle || content.heroTitle;

    // Helper to update or create meta tags
    const updateMeta = (name: string, value: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    // Standard Description
    updateMeta('description', content.seoDescription);

    // Open Graph (Social Media / WhatsApp)
    updateMeta('og:title', content.seoTitle, 'property');
    updateMeta('og:description', content.seoDescription, 'property');
    updateMeta('og:type', 'website', 'property');
    if (content.seoImage) {
      updateMeta('og:image', content.seoImage, 'property');
    }
    // Note: To have a perfect WhatsApp preview, the image usually needs to be served via a public URL (not base64), 
    // but base64 works in some contexts or locally. For production, uploading to a bucket is better, 
    // but this meets the requirement of "locally managed".
  }, [content]);
  // ---------------------------

  // Safe scroll function that doesn't trigger navigation
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

  if (currentView === 'admin') {
    return isLoggedIn ? <AdminDashboard /> : <AdminLogin />;
  }

  return (
    <div className={`min-h-screen ${theme.bg} text-white font-sans selection:bg-white/20 selection:text-white`}>
      {/* Navigation */}
      <nav className={`fixed w-full z-50 ${theme.nav} backdrop-blur-md border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
              {content.logoImage ? (
                <img src={content.logoImage} alt={content.logoText} className="h-10 w-auto object-contain" />
              ) : (
                <>
                    <Globe className={`w-6 h-6 ${theme.icon}`} />
                    <span className="font-bold text-xl tracking-wider text-white">{content.logoText}</span>
                </>
              )}
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button onClick={() => scrollToSection('home')} className={`hover:${theme.primary} transition px-3 py-2 rounded-md font-medium bg-transparent border-none cursor-pointer`}>Início</button>
                <button onClick={() => scrollToSection('planos')} className={`hover:${theme.primary} transition px-3 py-2 rounded-md font-medium bg-transparent border-none cursor-pointer`}>Planos</button>
                <button onClick={() => scrollToSection('instrucoes')} className={`hover:${theme.primary} transition px-3 py-2 rounded-md font-medium bg-transparent border-none cursor-pointer`}>Instalação</button>
                <button onClick={() => scrollToSection('contato')} className={`hover:${theme.primary} transition px-3 py-2 rounded-md font-medium bg-transparent border-none cursor-pointer`}>Contato</button>
              </div>
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
             <button onClick={() => scrollToSection('home')} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium">Início</button>
             <button onClick={() => scrollToSection('planos')} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium">Planos</button>
             <button onClick={() => scrollToSection('instrucoes')} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium">Instalação</button>
             <button onClick={() => scrollToSection('contato')} className="block w-full text-left hover:bg-white/10 px-4 py-3 text-sm font-medium">Contato</button>
          </div>
        )}
      </nav>

      <Hero />
      <Plans />
      <div id="instrucoes">
        <Instructions />
      </div>
      <div id="contato">
        <LeadCapture />
      </div>
      
      {/* Footer */}
      <footer className={`${theme.bg} py-8 border-t ${theme.border} text-center text-slate-500 text-sm flex flex-col items-center gap-2`}>
        <p>&copy; {new Date().getFullYear()} <span className="text-slate-300 font-semibold">{content.footerText || content.logoText}</span>. Todos os direitos reservados.</p>
        <p className="text-xs">
          Desenvolvido por <a href="https://to-ligado.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-bold transition">To-Ligado.com</a>
        </p>
        <div className="mt-2">
            <button onClick={() => setView('admin')} className="opacity-20 hover:opacity-100 transition bg-transparent border-none cursor-pointer underline text-xs">
              Acesso Admin
            </button>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
