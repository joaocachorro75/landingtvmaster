import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plan, ThemeOption, PixKeyType, Lead } from '../../types';
import { LogOut, Users, CreditCard, Settings, Download, Trash2, Plus, Palette, Image as ImageIcon, Save, Edit2, XCircle, Upload, Smartphone, Search, MonitorPlay, Tv, Briefcase } from 'lucide-react';
import { THEME_CONFIG } from '../../constants';

type Tab = 'content' | 'plans' | 'leads' | 'seo' | 'instructions';

const AdminDashboard: React.FC = () => {
  const { logout, content, updateContent, plans, addPlan, deletePlan, updatePlan, leads, deleteLead, updateLead } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('content');

  // State for adding/editing a plan
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<Partial<Plan>>({
    name: '', price: 0, period: 'mês', features: [], recommended: false
  });
  const [featureInput, setFeatureInput] = useState('');

  // State for Editing a Lead
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState<Partial<Lead>>({ name: '', whatsapp: '' });

  // Local state for settings to simulate "Save Changes" feeling
  const [localContent, setLocalContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local content when global content changes (e.g. initial load)
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleLocalUpdate = (update: Partial<typeof content>) => {
    setLocalContent(prev => ({ ...prev, ...update }));
    setHasUnsavedChanges(true);
  };

  const handleInstructionUpdate = (idx: number, field: 'name' | 'steps' | 'iconKey', value: any) => {
    const updatedInstructions = [...(localContent.instructions || [])];
    if (field === 'steps') {
        // Expecting value to be string from textarea, split by newline
        updatedInstructions[idx] = { ...updatedInstructions[idx], steps: value.split('\n') };
    } else {
        updatedInstructions[idx] = { ...updatedInstructions[idx], [field]: value };
    }
    handleLocalUpdate({ instructions: updatedInstructions });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'heroImage' | 'logoImage' | 'seoImage') => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to ~2MB to prevent LocalStorage issues)
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleLocalUpdate({ [field]: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    updateContent(localContent);
    setHasUnsavedChanges(false);
    alert("Configurações salvas com sucesso!");
  };

  // CSV Export
  const downloadCSV = () => {
    const headers = ['Nome,WhatsApp,Data\n'];
    const rows = leads.map(l => {
        // Data is already formatted to international in AppContext
        return `${l.name},${l.whatsapp},${new Date(l.date).toLocaleDateString()}`;
    });
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_capturados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Plan Handlers
  const handleEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({ ...plan });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setPlanForm({ name: '', price: 0, period: 'mês', features: [], recommended: false });
  };

  const handleSavePlan = () => {
    if (planForm.name && planForm.price) {
      if (editingPlanId) {
        // Edit existing
        updatePlan(editingPlanId, planForm);
        alert("Plano atualizado!");
      } else {
        // Add new
        addPlan({
          id: Math.random().toString(36).substr(2, 9),
          name: planForm.name,
          price: Number(planForm.price),
          period: planForm.period || 'mês',
          features: planForm.features || [],
          recommended: planForm.recommended
        } as Plan);
        alert("Plano criado!");
      }
      handleCancelEdit(); // Reset form
    } else {
        alert("Nome e Preço são obrigatórios");
    }
  };

  // Lead Handlers
  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setLeadForm({ name: lead.name, whatsapp: lead.whatsapp });
  };

  const handleSaveLead = () => {
    if (editingLeadId && leadForm.name && leadForm.whatsapp) {
        const success = updateLead(editingLeadId, leadForm);
        if (success) {
            setEditingLeadId(null);
            setLeadForm({ name: '', whatsapp: '' });
            alert("Lead atualizado!");
        } else {
            alert("Erro: Este número de WhatsApp já pertence a outro lead.");
        }
    } else {
        alert("Preencha todos os campos.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-violet-400">Painel Administrativo</h1>
        <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-800/50 border-r border-slate-700 p-4 shrink-0">
          <nav className="space-y-2 sticky top-24">
            <button 
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'content' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <Settings className="w-5 h-5" /> Configurações Gerais
            </button>
            <button 
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'plans' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <CreditCard className="w-5 h-5" /> Gerenciar Planos
            </button>
            <button 
              onClick={() => setActiveTab('instructions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'instructions' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <MonitorPlay className="w-5 h-5" /> Instruções (Apps)
            </button>
            <button 
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'seo' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <Search className="w-5 h-5" /> SEO & Rodapé
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'leads' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <Users className="w-5 h-5" /> Leads Capturados
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          
          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="space-y-6 max-w-4xl pb-20">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">Personalização do Site</h2>
                 <button 
                    onClick={saveSettings} 
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg transition ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}
                 >
                    <Save className="w-4 h-4" /> {hasUnsavedChanges ? 'Salvar Mudanças' : 'Salvo'}
                 </button>
              </div>

              {/* Reseller Toggle */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-yellow-500" /> Opção de Revenda</h3>
                  <p className="text-sm text-slate-400">Habilitar botão "Seja Revendedor" na página principal.</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-sm font-bold ${localContent.enableReseller ? 'text-green-400' : 'text-red-400'}`}>
                     {localContent.enableReseller ? 'ATIVADO' : 'DESATIVADO'}
                   </span>
                   <button 
                    onClick={() => handleLocalUpdate({ enableReseller: !localContent.enableReseller })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${localContent.enableReseller ? 'bg-green-600' : 'bg-slate-600'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${localContent.enableReseller ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                </div>
              </div>
              
              {/* Theme Selector */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-semibold text-white">Aparência do Site</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {(Object.keys(THEME_CONFIG) as ThemeOption[]).map((themeKey) => (
                     <button
                        key={themeKey}
                        onClick={() => handleLocalUpdate({ theme: themeKey })}
                        className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${localContent.theme === themeKey ? 'border-violet-500 bg-slate-700' : 'border-slate-600 bg-slate-900 hover:bg-slate-700'}`}
                     >
                        <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${THEME_CONFIG[themeKey].button} ${THEME_CONFIG[themeKey].buttonTo}`}></div>
                        <span className="font-medium">{THEME_CONFIG[themeKey].name}</span>
                        {localContent.theme === themeKey && <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></span>}
                     </button>
                   ))}
                 </div>
              </div>

              {/* Text & Image Inputs */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-semibold text-white">Conteúdo Visual e Textual</h3>
                </div>
                
                {/* LOGO UPLOAD */}
                <div className="border border-slate-700 p-4 rounded-lg bg-slate-900/50">
                  <label className="block text-sm text-slate-400 mb-2">Logomarca (Imagem)</label>
                  <div className="flex items-start gap-4">
                      {localContent.logoImage ? (
                          <div className="w-32 h-16 bg-slate-800 border border-slate-600 rounded flex items-center justify-center p-2 relative group">
                              <img src={localContent.logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                              <button onClick={() => handleLocalUpdate({ logoImage: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"><XCircle className="w-4 h-4"/></button>
                          </div>
                      ) : (
                          <div className="w-32 h-16 bg-slate-800 border border-slate-600 border-dashed rounded flex items-center justify-center text-slate-500 text-xs">
                              Sem Logo
                          </div>
                      )}
                      <div className="flex-1">
                          <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded inline-flex items-center gap-2 transition">
                              <Upload className="w-4 h-4" /> Fazer Upload da Logo
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoImage')} />
                          </label>
                          <p className="text-xs text-slate-500 mt-2">Recomendado: PNG transparente (max 2MB)</p>
                      </div>
                  </div>
                  <div className="mt-3">
                      <label className="block text-xs text-slate-500 mb-1">Nome Alternativo (Texto caso não tenha imagem)</label>
                      <input type="text" value={localContent.logoText || ''} onChange={(e) => handleLocalUpdate({ logoText: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
                  </div>
                </div>

                {/* BACKGROUND UPLOAD */}
                <div className="border border-slate-700 p-4 rounded-lg bg-slate-900/50">
                  <label className="block text-sm text-slate-400 mb-2">Imagem de Fundo (Banner Principal)</label>
                  <div className="space-y-3">
                    {localContent.heroImage && (
                        <div className="w-full h-40 bg-slate-800 border border-slate-600 rounded overflow-hidden relative">
                             <img src={localContent.heroImage} alt="Banner Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded inline-flex items-center gap-2 transition w-full justify-center">
                        <Upload className="w-4 h-4" /> Alterar Imagem de Fundo
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} />
                    </label>
                    <p className="text-xs text-slate-500">Recomendado: JPG alta qualidade (max 2MB)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Título Hero</label>
                  <input type="text" value={localContent.heroTitle || ''} onChange={(e) => handleLocalUpdate({ heroTitle: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Subtítulo Hero</label>
                  <textarea value={localContent.heroSubtitle || ''} onChange={(e) => handleLocalUpdate({ heroSubtitle: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-24" />
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-semibold text-white">Pagamentos & Contatos</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Tipo de Chave PIX</label>
                        <select 
                            value={localContent.pixKeyType || 'cpf'} 
                            onChange={(e) => handleLocalUpdate({ pixKeyType: e.target.value as PixKeyType })} 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                        >
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                            <option value="phone">Telefone (Celular)</option>
                            <option value="email">E-mail</option>
                            <option value="random">Chave Aleatória</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Chave PIX</label>
                        <input type="text" value={localContent.pixKey || ''} onChange={(e) => handleLocalUpdate({ pixKey: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="Sua chave aqui" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700 mt-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <label className="block text-sm font-bold text-green-400 mb-1">WhatsApp Comercial</label>
                        <p className="text-xs text-slate-500 mb-2">Define o número do <strong>Botão Flutuante</strong> e solicitação de <strong>Testes</strong>.</p>
                        <input 
                            type="text" 
                            value={localContent.salesWhatsapp || ''} 
                            onChange={(e) => handleLocalUpdate({ salesWhatsapp: e.target.value })} 
                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-green-500" 
                            placeholder="Ex: 5511999999999" 
                        />
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <label className="block text-sm font-bold text-blue-400 mb-1">WhatsApp Financeiro</label>
                         <p className="text-xs text-slate-500 mb-2">Define o número para onde o cliente envia o <strong>Comprovante PIX</strong>.</p>
                        <input 
                            type="text" 
                            value={localContent.adminWhatsapp || ''} 
                            onChange={(e) => handleLocalUpdate({ adminWhatsapp: e.target.value })} 
                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500" 
                            placeholder="Ex: 5511999999999" 
                        />
                    </div>
                </div>
              </div>
            </div>
          )}
          
          {/* INSTRUCTIONS TAB */}
          {activeTab === 'instructions' && (
              <div className="space-y-6 max-w-4xl pb-20">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Instruções de Instalação</h2>
                    <button 
                        onClick={saveSettings} 
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg transition ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}
                    >
                        <Save className="w-4 h-4" /> {hasUnsavedChanges ? 'Salvar Mudanças' : 'Salvo'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                      {(localContent.instructions || []).map((app, idx) => (
                          <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-slate-700 rounded-lg">
                                    {app.iconKey === 'tv' && <Tv className="w-6 h-6 text-violet-400" />}
                                    {app.iconKey === 'monitor' && <MonitorPlay className="w-6 h-6 text-violet-400" />}
                                    {app.iconKey === 'smartphone' && <Smartphone className="w-6 h-6 text-violet-400" />}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">Nome do Aplicativo</label>
                                    <input 
                                        type="text" 
                                        value={app.name} 
                                        onChange={(e) => handleInstructionUpdate(idx, 'name', e.target.value)} 
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-bold"
                                    />
                                </div>
                                <div className="w-32">
                                     <label className="block text-xs text-slate-400 mb-1">Ícone</label>
                                     <select 
                                        value={app.iconKey}
                                        onChange={(e) => handleInstructionUpdate(idx, 'iconKey', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                                     >
                                        <option value="tv">TV</option>
                                        <option value="monitor">Monitor/PC</option>
                                        <option value="smartphone">Celular</option>
                                     </select>
                                </div>
                             </div>
                             <div>
                                 <label className="block text-xs text-slate-400 mb-1">Passos (Um por linha)</label>
                                 <textarea 
                                    rows={4}
                                    value={app.steps.join('\n')} 
                                    onChange={(e) => handleInstructionUpdate(idx, 'steps', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm"
                                 />
                             </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* SEO TAB */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-4xl pb-20">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">Otimização (SEO) e Rodapé</h2>
                 <button 
                    onClick={saveSettings} 
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg transition ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}
                 >
                    <Save className="w-4 h-4" /> {hasUnsavedChanges ? 'Salvar Mudanças' : 'Salvo'}
                 </button>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-semibold text-white">Configurações de Busca e Social</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Essas configurações definem como seu site aparece no Google, WhatsApp e Facebook.</p>

                  <div>
                      <label className="block text-sm text-slate-300 mb-1 font-bold">Título da Página (Browser/Google)</label>
                      <input type="text" value={localContent.seoTitle || ''} onChange={(e) => handleLocalUpdate({ seoTitle: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="Ex: UltraStream - A Melhor TV do Brasil" />
                  </div>

                  <div>
                      <label className="block text-sm text-slate-300 mb-1 font-bold">Descrição (Meta Description)</label>
                      <textarea value={localContent.seoDescription || ''} onChange={(e) => handleLocalUpdate({ seoDescription: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-24" placeholder="Ex: Teste grátis agora..." />
                  </div>

                  {/* SEO IMAGE UPLOAD */}
                  <div className="border border-slate-700 p-4 rounded-lg bg-slate-900/50">
                    <label className="block text-sm text-slate-300 mb-2 font-bold">Imagem de Compartilhamento (Social Preview)</label>
                    <p className="text-xs text-slate-500 mb-3">Essa imagem aparece quando você envia o link no WhatsApp ou Facebook.</p>
                    <div className="space-y-3">
                      {localContent.seoImage ? (
                          <div className="w-full h-48 bg-slate-800 border border-slate-600 rounded overflow-hidden relative flex items-center justify-center">
                               <img src={localContent.seoImage} alt="Social Preview" className="h-full object-contain" />
                               <button onClick={() => handleLocalUpdate({ seoImage: '' })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"><XCircle className="w-4 h-4"/></button>
                          </div>
                      ) : (
                          <div className="w-full h-24 bg-slate-800 border border-slate-600 border-dashed rounded flex items-center justify-center text-slate-500">
                              Nenhuma imagem definida
                          </div>
                      )}
                      <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded inline-flex items-center gap-2 transition w-full justify-center">
                          <Upload className="w-4 h-4" /> Escolher Imagem (Max 2MB)
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'seoImage')} />
                      </label>
                    </div>
                  </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Rodapé (Footer)</h3>
                  <div>
                      <label className="block text-sm text-slate-300 mb-1 font-bold">Texto de Copyright</label>
                      <input type="text" value={localContent.footerText || ''} onChange={(e) => handleLocalUpdate({ footerText: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="Ex: ULTRA STREAM" />
                      <p className="text-xs text-slate-500 mt-1">Aparecerá como: © 202X [SEU TEXTO]. Todos os direitos reservados.</p>
                  </div>
              </div>
            </div>
          )}

          {/* PLANS TAB */}
          {activeTab === 'plans' && (
            <div className="space-y-6 pb-20">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Planos Ativos ({plans?.length || 0}/6)</h2>
              </div>

              {/* Add/Edit Plan Form */}
              <div className={`bg-slate-800 p-6 rounded-xl border ${editingPlanId ? 'border-violet-500 shadow-violet-500/20 shadow-lg' : 'border-slate-700'} mb-8 transition-all`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-violet-300">
                        {editingPlanId ? `Editando: ${plans.find(p => p.id === editingPlanId)?.name}` : 'Adicionar Novo Plano'}
                    </h3>
                    {editingPlanId && (
                        <button onClick={handleCancelEdit} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Cancelar Edição
                        </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Nome do Plano</label>
                        <input type="text" placeholder="Ex: Mensal" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Preço</label>
                        <input type="number" placeholder="Ex: 30.00" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={planForm.price || ''} onChange={e => setPlanForm({...planForm, price: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Período</label>
                        <input type="text" placeholder="Ex: mês" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={planForm.period} onChange={e => setPlanForm({...planForm, period: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" id="rec" checked={planForm.recommended} onChange={e => setPlanForm({...planForm, recommended: e.target.checked})} className="w-5 h-5 accent-violet-600" />
                      <label htmlFor="rec" className="text-sm cursor-pointer select-none">Marcar como Recomendado?</label>
                    </div>
                  </div>
                  <div className="mb-4">
                     <p className="text-sm text-slate-400 mb-1">Características:</p>
                     <div className="flex gap-2">
                       <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="Digite e clique em +" />
                       <button onClick={() => { if(featureInput) { setPlanForm({...planForm, features: [...(planForm.features || []), featureInput]}); setFeatureInput(''); }}} className="bg-slate-700 hover:bg-slate-600 px-4 rounded text-white font-bold">+</button>
                     </div>
                     <div className="flex flex-wrap gap-2 mt-3">
                       {planForm.features?.map((f, i) => (
                         <span key={i} className="bg-slate-700 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                            {f}
                            <button onClick={() => setPlanForm({...planForm, features: planForm.features?.filter((_, idx) => idx !== i)})} className="hover:text-red-400">×</button>
                         </span>
                       ))}
                     </div>
                  </div>
                  <button 
                    onClick={handleSavePlan} 
                    className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 transition ${editingPlanId ? 'bg-green-600 hover:bg-green-500' : 'bg-violet-600 hover:bg-violet-500'} text-white`}
                    disabled={(plans.length >= 6 && !editingPlanId)}
                  >
                    {editingPlanId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingPlanId ? 'Salvar Alterações do Plano' : (plans.length >= 6 ? 'Limite de Planos Atingido' : 'Criar Plano')}
                  </button>
              </div>

              {/* List Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans?.map(plan => (
                  <div key={plan.id} className={`bg-slate-800 p-6 rounded-xl border relative group ${plan.id === editingPlanId ? 'border-violet-500 opacity-50' : 'border-slate-700'}`}>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditPlan(plan)} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition" title="Editar">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deletePlan(plan.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <h3 className="font-bold text-xl">{plan.name}</h3>
                    <p className="text-2xl font-bold text-violet-400">R$ {plan.price}</p>
                    <p className="text-sm text-slate-400 mb-4">/{plan.period}</p>
                    <ul className="text-sm space-y-1 mb-4">
                      {plan.features?.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                    {plan.recommended && <span className="bg-violet-600 text-xs px-2 py-1 rounded">Recomendado</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Leads Capturados</h2>
                <button onClick={downloadCSV} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>

              {/* Edit Lead Form (Only shows when editing) */}
              {editingLeadId && (
                <div className="bg-slate-800 p-6 rounded-xl border border-violet-500 shadow-violet-500/20 shadow-lg mb-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-violet-300">Editar Lead</h3>
                        <button onClick={() => setEditingLeadId(null)} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Cancelar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Nome</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">WhatsApp</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" value={leadForm.whatsapp} onChange={e => setLeadForm({...leadForm, whatsapp: e.target.value})} />
                        </div>
                    </div>
                    <button onClick={handleSaveLead} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded font-bold text-white flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> Salvar Alterações
                    </button>
                </div>
              )}

              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-700 text-slate-300">
                    <tr>
                      <th className="p-4">Nome</th>
                      <th className="p-4">WhatsApp</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {leads?.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum lead capturado ainda.</td></tr>
                    ) : leads?.map(lead => (
                      <tr key={lead.id} className={`hover:bg-slate-700/50 ${editingLeadId === lead.id ? 'bg-violet-900/20' : ''}`}>
                        <td className="p-4">{lead.name}</td>
                        <td className="p-4">
                          <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline flex items-center gap-1">
                            {lead.whatsapp}
                          </a>
                        </td>
                        <td className="p-4 text-sm text-slate-400">{new Date(lead.date).toLocaleDateString()}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleEditLead(lead)} className="p-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded transition" title="Editar">
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteLead(lead.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded transition" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
