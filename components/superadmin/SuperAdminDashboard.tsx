import React, { useState, useEffect } from 'react';
import { LogOut, Users, CreditCard, TrendingUp, DollarSign, Calendar, CheckCircle, XCircle, Clock, Search, Download, Eye, Trash2, Settings, Globe } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  whatsapp: string;
  email?: string;
  plan: 'parceiro' | 'basico' | 'premium';
  status: 'active' | 'inactive' | 'trial';
  created_at: string;
  expires_at?: string;
  instance_name?: string;
  subdomain?: string;
}

interface Payment {
  id: number;
  client_id: number;
  client_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  paid_at?: string;
  plan: string;
}

interface Stats {
  totalClients: number;
  activeClients: number;
  monthlyRevenue: number;
  pendingPayments: number;
  newClientsThisMonth: number;
}

const SuperAdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'payments' | 'plans'>('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    newClientsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar clientes
      const clientsRes = await fetch('/api/saas/clients');
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        const clientsData = data.clients || data || [];
        setClients(Array.isArray(clientsData) ? clientsData : []);
        
        // Calcular stats
        const active = clientsData.filter((c: Client) => c.status === 'active').length;
        const thisMonth = clientsData.filter((c: Client) => {
          const created = new Date(c.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;
        
        setStats(prev => ({
          ...prev,
          totalClients: clientsData.length,
          activeClients: active,
          newClientsThisMonth: thisMonth
        }));
      }

      // Carregar pagamentos
      const paymentsRes = await fetch('/api/saas/payments');
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        const paymentsData = data.payments || data || [];
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        
        const pending = paymentsData.filter((p: Payment) => p.status === 'pending').length;
        const revenue = paymentsData
          .filter((p: Payment) => p.status === 'paid' && new Date(p.paid_at || '').getMonth() === new Date().getMonth())
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);
        
        setStats(prev => ({
          ...prev,
          pendingPayments: pending,
          monthlyRevenue: revenue
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateClient = async (clientId: number) => {
    try {
      const res = await fetch(`/api/saas/clients/${clientId}/activate`, { method: 'POST' });
      if (res.ok) {
        loadData();
        alert('Cliente ativado com sucesso!');
      }
    } catch (error) {
      alert('Erro ao ativar cliente');
    }
  };

  const handleDeactivateClient = async (clientId: number) => {
    if (!confirm('Tem certeza que deseja desativar este cliente?')) return;
    try {
      const res = await fetch(`/api/saas/clients/${clientId}/deactivate`, { method: 'POST' });
      if (res.ok) {
        loadData();
        alert('Cliente desativado.');
      }
    } catch (error) {
      alert('Erro ao desativar cliente');
    }
  };

  const handleMarkPaymentPaid = async (paymentId: number) => {
    try {
      const res = await fetch(`/api/saas/payments/${paymentId}/pay`, { method: 'POST' });
      if (res.ok) {
        loadData();
        alert('Pagamento marcado como pago!');
      }
    } catch (error) {
      alert('Erro ao processar pagamento');
    }
  };

  const exportClientsCSV = () => {
    const headers = ['Nome,WhatsApp,Email,Plano,Status,Criado em,Expira em\n'];
    const rows = clients.map(c => 
      `${c.name},${c.whatsapp},${c.email || ''},${c.plan},${c.status},${c.created_at},${c.expires_at || ''}`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'clientes_saas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.whatsapp.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-violet-400" />
          <div>
            <h1 className="text-xl font-bold text-violet-400">Super Admin - Revendas TV SaaS</h1>
            <p className="text-xs text-slate-400">Painel de gerenciamento do SaaS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://site.to-ligado.com" target="_blank" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <Globe className="w-4 h-4" /> Site Principal
          </a>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition bg-slate-700 px-4 py-2 rounded-lg">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-800/50 border-r border-slate-700 p-4 shrink-0">
          <nav className="space-y-2 sticky top-24">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'overview' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <TrendingUp className="w-5 h-5" /> Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'clients' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <Users className="w-5 h-5" /> Clientes
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'payments' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <CreditCard className="w-5 h-5" /> Pagamentos
            </button>
            <button 
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'plans' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              <Settings className="w-5 h-5" /> Planos SaaS
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Visão Geral</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">Total de Clientes</p>
                      <p className="text-3xl font-bold">{stats.totalClients}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-sm text-slate-400">Clientes Ativos</p>
                      <p className="text-3xl font-bold text-green-400">{stats.activeClients}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8 text-violet-400" />
                    <div>
                      <p className="text-sm text-slate-400">Receita Mensal</p>
                      <p className="text-3xl font-bold text-violet-400">R$ {stats.monthlyRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-sm text-slate-400">Pag. Pendentes</p>
                      <p className="text-3xl font-bold text-yellow-400">{stats.pendingPayments}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Clients */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold mb-4">Clientes Recentes</h3>
                <div className="space-y-3">
                  {clients.slice(0, 5).map(client => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-slate-400">{client.whatsapp}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${client.plan === 'premium' ? 'bg-violet-600' : client.plan === 'basico' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                          {client.plan}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CLIENTS TAB */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Clientes</h2>
                <button onClick={exportClientsCSV} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, WhatsApp ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white"
                />
              </div>

              {/* Clients Table */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-700 text-slate-300">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Plano</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Criado</th>
                      <th className="p-4">Expira</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Nenhum cliente encontrado.
                        </td>
                      </tr>
                    ) : filteredClients.map(client => (
                      <tr key={client.id} className="hover:bg-slate-700/50">
                        <td className="p-4">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-slate-400">{client.whatsapp}</p>
                          {client.email && <p className="text-xs text-slate-500">{client.email}</p>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${client.plan === 'premium' ? 'bg-violet-600' : client.plan === 'basico' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                            {client.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 ${client.status === 'active' ? 'text-green-400' : client.status === 'trial' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {client.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {client.status === 'active' ? 'Ativo' : client.status === 'trial' ? 'Trial' : 'Inativo'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {new Date(client.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {client.expires_at ? new Date(client.expires_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {client.status !== 'active' && (
                              <button
                                onClick={() => handleActivateClient(client.id)}
                                className="p-2 text-green-400 hover:text-white bg-green-500/10 hover:bg-green-600 rounded transition"
                                title="Ativar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {client.status === 'active' && (
                              <button
                                onClick={() => handleDeactivateClient(client.id)}
                                className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded transition"
                                title="Desativar"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            {client.instance_name && (
                              <a
                                href={`https://${client.instance_name}.to-ligado.com`}
                                target="_blank"
                                className="p-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded transition"
                                title="Ver site do cliente"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Pagamentos</h2>

              {/* Payments Table */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-700 text-slate-300">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Plano</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Vencimento</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Nenhum pagamento registrado.
                        </td>
                      </tr>
                    ) : payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-slate-700/50">
                        <td className="p-4">
                          <p className="font-medium">{payment.client_name}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-xs bg-slate-600">{payment.plan}</span>
                        </td>
                        <td className="p-4 font-bold text-violet-400">
                          R$ {payment.amount.toFixed(2)}
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {new Date(payment.due_date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 ${payment.status === 'paid' ? 'text-green-400' : payment.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {payment.status === 'paid' ? <CheckCircle className="w-4 h-4" /> : payment.status === 'pending' ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {payment.status === 'paid' ? 'Pago' : payment.status === 'pending' ? 'Pendente' : 'Vencido'}
                          </span>
                        </td>
                        <td className="p-4">
                          {payment.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaymentPaid(payment.id)}
                              className="p-2 text-green-400 hover:text-white bg-green-500/10 hover:bg-green-600 rounded transition"
                              title="Marcar como pago"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {payment.status === 'paid' && payment.paid_at && (
                            <span className="text-xs text-slate-400">
                              Pago em {new Date(payment.paid_at).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PLANS TAB */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Planos do SaaS</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Parceiro */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-xl font-bold mb-2">Parceiro</h3>
                  <p className="text-3xl font-bold text-slate-400 mb-4">Grátis</p>
                  <ul className="text-sm space-y-2 mb-4">
                    <li>✓ Landing page personalizada</li>
                    <li>✓ Captura de leads</li>
                    <li>✓ Botão WhatsApp</li>
                    <li className="text-slate-500">✗ Domínio personalizado</li>
                    <li className="text-slate-500">✗ Pagamentos automáticos</li>
                  </ul>
                  <p className="text-xs text-slate-400">Para testes e parceiros</p>
                </div>

                {/* Básico */}
                <div className="bg-slate-800 p-6 rounded-xl border border-blue-500 relative">
                  <span className="absolute top-2 right-2 bg-blue-500 text-xs px-2 py-1 rounded">Popular</span>
                  <h3 className="text-xl font-bold mb-2">Básico</h3>
                  <p className="text-3xl font-bold text-blue-400 mb-4">R$ 9,90<span className="text-sm text-slate-400">/mês</span></p>
                  <ul className="text-sm space-y-2 mb-4">
                    <li>✓ Tudo do Parceiro</li>
                    <li>✓ Domínio personalizado</li>
                    <li>✓ Múltiplos planos</li>
                    <li>✓ SEO configurável</li>
                    <li className="text-slate-500">✗ Funcionários IA</li>
                  </ul>
                  <p className="text-xs text-slate-400">Para pequenos revendedores</p>
                </div>

                {/* Premium */}
                <div className="bg-gradient-to-b from-violet-900/50 to-slate-800 p-6 rounded-xl border border-violet-500 relative">
                  <span className="absolute top-2 right-2 bg-violet-500 text-xs px-2 py-1 rounded">Recomendado</span>
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <p className="text-3xl font-bold text-violet-400 mb-4">R$ 99<span className="text-sm text-slate-400">/mês</span></p>
                  <ul className="text-sm space-y-2 mb-4">
                    <li>✓ Tudo do Básico</li>
                    <li>✓ Funcionários IA ilimitados</li>
                    <li>✓ Pagamentos automáticos</li>
                    <li>✓ Gestão de cobrança</li>
                    <li>✓ Suporte prioritário</li>
                  </ul>
                  <p className="text-xs text-slate-400">Para revendedores profissionais</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
