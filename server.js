import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// --- DATABASE CONFIG ---
const DB_CONFIG = {
  host: 'automacao_saasql',
  user: 'toligado',
  password: 'Naodigo2306@',
  database: 'saasql',
  waitForConnections: true,
  connectionLimit: 10
};

const pool = mysql.createPool(DB_CONFIG);

// --- MULTI-SITE ISOLATION LOGIC ---
const APP_NAME = process.env.APP_NAME || ''; 

// Configuração de Pastas (usando /data para volume persistente)
const BASE_DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_DIR = path.join(BASE_DATA_DIR, APP_NAME); 
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(BASE_DATA_DIR)) {
  try { fs.mkdirSync(BASE_DATA_DIR, { recursive: true }); } catch(e) {}
}
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {
    console.error(`FATAL: Could not create data directory at ${DATA_DIR}`, e);
  }
}
if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch(e) {}
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// --- Database Helper (JSON) ---
const getDefaults = () => ({ leads: [], plans: [], content: {} });

const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) return getDefaults();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    if (!data.trim()) return getDefaults();
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading DB:`, err);
    return getDefaults();
  }
};

const writeDb = (data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const uniqueId = `${process.pid}-${Math.floor(Math.random() * 10000)}`;
    const tempFile = `${DB_FILE}.${uniqueId}.tmp`;
    fs.writeFileSync(tempFile, jsonString);
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error(`Error writing to DB:`, err);
  }
};

// --- WhatsApp Notification Helper ---
const EVOLUTION_API_URL = 'https://automacao-evolution-api.nfeujb.easypanel.host';
const EVOLUTION_INSTANCE = 'toligado';
const EVOLUTION_API_KEY = '5BE128D18942-4B09-8AF8-454ADEEB06B1';

async function sendWhatsAppMessage(phone, message) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        number: phone.replace(/\D/g, ''),
        textMessage: { text: message }
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}

// --- Funcionarios IA Integration ---
const FUNCIONARIOS_IA_URL = 'https://funcionariosia.to-ligado.com';
const SYNC_API_KEY = 'toligado_sync_2026';

async function createFuncionarioIA(name, whatsapp) {
  try {
    const response = await fetch(`${FUNCIONARIOS_IA_URL}/api/sync/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order: { customerName: name, customerWhatsapp: whatsapp, plan: 'premium' },
        apiKey: SYNC_API_KEY
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao criar funcionário IA:', error);
    return false;
  }
}

// ============================================
// ROTAS ORIGINAIS (Landing Page Individual)
// ============================================

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

app.get('/api/db', (req, res) => {
  const data = readDb();
  res.json(data);
});

app.post('/api/config', (req, res) => {
  try {
      const { content, plans } = req.body;
      const db = readDb();
      if (content) db.content = content;
      if (plans) db.plans = plans;
      writeDb(db);
      res.json({ success: true });
  } catch (error) {
      res.status(500).json({ success: false });
  }
});

app.post('/api/leads', (req, res) => {
  try {
      const newLead = req.body;
      const db = readDb();
      if (!db.leads) db.leads = [];
      const exists = db.leads.some(l => l.whatsapp === newLead.whatsapp);
      if (exists) return res.status(400).json({ success: false });
      db.leads.unshift(newLead);
      writeDb(db);
      res.json({ success: true });
  } catch (error) {
      res.status(500).json({ success: false });
  }
});

app.post('/api/leads/update', (req, res) => {
    try {
        const { id, action, data } = req.body;
        const db = readDb();
        if (action === 'delete') {
            db.leads = (db.leads || []).filter(l => l.id !== id);
        } else if (action === 'update') {
            db.leads = (db.leads || []).map(l => l.id === id ? { ...l, ...data } : l);
        }
        writeDb(db);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// ============================================
// ROTAS SAAS REVENDAS
// ============================================

// --- CLIENTES ---

// Listar todos os clientes
app.get('/api/saas/clients', async (req, res) => {
  try {
    const [clients] = await pool.execute(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM revendas_instances WHERE client_id = c.id) as instance_count,
        (SELECT COUNT(*) FROM revendas_payments WHERE client_id = c.id AND status = 'pending') as pending_payments
      FROM revendas_clients c
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, clients });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar clientes' });
  }
});

// Buscar cliente por ID
app.get('/api/saas/clients/:id', async (req, res) => {
  try {
    const [clients] = await pool.execute(
      'SELECT * FROM revendas_clients WHERE id = ?',
      [req.params.id]
    );
    if (clients.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }
    
    const [instances] = await pool.execute(
      'SELECT * FROM revendas_instances WHERE client_id = ?',
      [req.params.id]
    );
    
    const [payments] = await pool.execute(
      'SELECT * FROM revendas_payments WHERE client_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    
    res.json({ 
      success: true, 
      client: { ...clients[0], instances, payments } 
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar cliente' });
  }
});

// Criar novo cliente (compra)
app.post('/api/saas/clients', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, email, whatsapp, plan } = req.body;
    
    // Validar dados
    if (!name || !whatsapp || !plan) {
      return res.status(400).json({ success: false, message: 'Nome, WhatsApp e plano são obrigatórios' });
    }
    
    // Verificar se já existe
    const [existing] = await connection.execute(
      'SELECT id FROM revendas_clients WHERE whatsapp = ?',
      [whatsapp.replace(/\D/g, '')]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Já existe um cliente com este WhatsApp' });
    }
    
    await connection.beginTransaction();
    
    // Criar cliente com trial de 7 dias
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    const [result] = await connection.execute(
      `INSERT INTO revendas_clients (name, email, whatsapp, plan, status, trial_ends_at)
       VALUES (?, ?, ?, ?, 'trial', ?)`,
      [name, email, whatsapp.replace(/\D/g, ''), plan, trialEndsAt]
    );
    
    const clientId = result.insertId;
    
    // Criar instância (subdomínio)
    const subdomain = `cliente${clientId}`;
    await connection.execute(
      `INSERT INTO revendas_instances (client_id, subdomain, status)
       VALUES (?, ?, 'active')`,
      [clientId, subdomain]
    );
    
    // Criar primeiro pagamento
    const amount = plan === 'premium' ? 99.00 : 9.99;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Vence junto com o trial
    
    await connection.execute(
      `INSERT INTO revendas_payments (client_id, amount, status, due_date)
       VALUES (?, ?, 'pending', ?)`,
      [clientId, amount, dueDate]
    );
    
    await connection.commit();
    
    // Se for Premium, criar funcionário IA
    if (plan === 'premium') {
      await createFuncionarioIA(name, whatsapp);
    }
    
    // Enviar WhatsApp com dados de acesso
    const message = `🎉 *Bem-vindo ao Revendas!*

Olá ${name}! Sua conta foi criada com sucesso!

📺 *Seu site:* https://${subdomain}.revendas.to-ligado.com
👤 *Seu plano:* ${plan === 'premium' ? 'Premium (R$ 99/mês)' : 'Básico (R$ 9,99/mês)'}
⏰ *Trial gratuito:* 7 dias

${plan === 'premium' ? '🤖 Seu funcionário IA também foi criado!' : ''}

*Dúvidas? Responda esta mensagem!*`;
    
    await sendWhatsAppMessage(whatsapp, message);
    
    res.json({ 
      success: true, 
      clientId,
      subdomain,
      message: 'Cliente criado com sucesso!' 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar cliente' });
  } finally {
    connection.release();
  }
});

// Atualizar status do cliente
app.patch('/api/saas/clients/:id/status', async (req, res) => {
  try {
    const { status, subscription_ends_at } = req.body;
    
    await pool.execute(
      'UPDATE revendas_clients SET status = ?, subscription_ends_at = ? WHERE id = ?',
      [status, subscription_ends_at || null, req.params.id]
    );
    
    res.json({ success: true, message: 'Status atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

// --- INSTÂNCIAS ---

// Listar instâncias
app.get('/api/saas/instances', async (req, res) => {
  try {
    const [instances] = await pool.execute(`
      SELECT i.*, c.name as client_name, c.plan, c.whatsapp
      FROM revendas_instances i
      JOIN revendas_clients c ON i.client_id = c.id
      ORDER BY i.created_at DESC
    `);
    res.json({ success: true, instances });
  } catch (error) {
    console.error('Erro ao listar instâncias:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar instâncias' });
  }
});

// Criar instância manualmente
app.post('/api/saas/instances', async (req, res) => {
  try {
    const { client_id, subdomain, custom_domain } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO revendas_instances (client_id, subdomain, custom_domain, status)
       VALUES (?, ?, ?, 'active')`,
      [client_id, subdomain, custom_domain || null]
    );
    
    res.json({ success: true, instanceId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar instância:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar instância' });
  }
});

// Atualizar status da instância
app.patch('/api/saas/instances/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE revendas_instances SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar instância:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar instância' });
  }
});

// --- PAGAMENTOS ---

// Listar pagamentos
app.get('/api/saas/payments', async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT p.*, c.name as client_name, c.whatsapp, c.plan
      FROM revendas_payments p
      JOIN revendas_clients c ON p.client_id = c.id
      ORDER BY p.due_date DESC
    `);
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar pagamentos' });
  }
});

// Registrar pagamento
app.post('/api/saas/payments/:id/pay', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const paymentId = req.params.id;
    
    await connection.beginTransaction();
    
    // Atualizar pagamento
    await connection.execute(
      'UPDATE revendas_payments SET status = ?, paid_at = NOW() WHERE id = ?',
      ['paid', paymentId]
    );
    
    // Buscar dados do pagamento
    const [payments] = await connection.execute(
      'SELECT p.*, c.name, c.whatsapp FROM revendas_payments p JOIN revendas_clients c ON p.client_id = c.id WHERE p.id = ?',
      [paymentId]
    );
    
    if (payments.length > 0) {
      const payment = payments[0];
      
      // Atualizar status do cliente para ativo
      const subscriptionEnds = new Date();
      subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);
      
      await connection.execute(
        'UPDATE revendas_clients SET status = ?, subscription_ends_at = ? WHERE id = ?',
        ['active', subscriptionEnds, payment.client_id]
      );
      
      // Criar próximo pagamento
      await connection.execute(
        'INSERT INTO revendas_payments (client_id, amount, status, due_date) VALUES (?, ?, ?, ?)',
        [payment.client_id, payment.amount, 'pending', subscriptionEnds]
      );
      
      // Enviar confirmação WhatsApp
      await sendWhatsAppMessage(payment.whatsapp, 
        `✅ *Pagamento Confirmado!*\n\nOlá ${payment.name}, seu pagamento foi recebido.\n\n📅 Próximo vencimento: ${subscriptionEnds.toLocaleDateString('pt-BR')}\n\nObrigado por escolher o Revendas!`
      );
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Pagamento registrado' });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ success: false, message: 'Erro ao registrar pagamento' });
  } finally {
    connection.release();
  }
});

// --- ESTATÍSTICAS ---

app.get('/api/saas/stats', async (req, res) => {
  try {
    const [clientsCount] = await pool.execute('SELECT COUNT(*) as total FROM revendas_clients');
    const [activeCount] = await pool.execute("SELECT COUNT(*) as total FROM revendas_clients WHERE status = 'active'");
    const [trialCount] = await pool.execute("SELECT COUNT(*) as total FROM revendas_clients WHERE status = 'trial'");
    const [premiumCount] = await pool.execute("SELECT COUNT(*) as total FROM revendas_clients WHERE plan = 'premium'");
    const [pendingPayments] = await pool.execute("SELECT SUM(amount) as total FROM revendas_payments WHERE status = 'pending'");
    const [paidThisMonth] = await pool.execute(`
      SELECT SUM(amount) as total FROM revendas_payments 
      WHERE status = 'paid' AND MONTH(paid_at) = MONTH(CURRENT_DATE())
    `);
    
    res.json({
      success: true,
      stats: {
        totalClients: clientsCount[0].total,
        activeClients: activeCount[0].total,
        trialClients: trialCount[0].total,
        premiumClients: premiumCount[0].total,
        pendingAmount: pendingPayments[0].total || 0,
        paidThisMonth: paidThisMonth[0].total || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
  }
});

// --- WEBHOOK PARA CHECKOUT ---

app.post('/api/saas/webhook/checkout', async (req, res) => {
  try {
    const { event, customer, plan } = req.body;
    
    if (event === 'purchase') {
      // Criar cliente via webhook (integração com gateway de pagamento)
      const response = await fetch(`http://localhost:${PORT}/api/saas/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          whatsapp: customer.whatsapp,
          plan: plan
        })
      });
      
      const result = await response.json();
      return res.json(result);
    }
    
    res.json({ success: true, message: 'Webhook recebido' });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ success: false, message: 'Erro no webhook' });
  }
});

// ============================================
// SISTEMA DE LEMBRETES AUTOMÁTICOS
// ============================================

// Verificar vencimentos e enviar lembretes
async function verificarVencimentos() {
  console.log('🔍 Verificando vencimentos...');
  
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // --- 3 DIAS ANTES DO VENCIMENTO ---
    const tresDiasDepois = new Date(hoje);
    tresDiasDepois.setDate(tresDiasDepois.getDate() + 3);
    
    const [pagamentos3Dias] = await pool.execute(`
      SELECT p.*, c.name, c.whatsapp, c.plan
      FROM revendas_payments p
      JOIN revendas_clients c ON p.client_id = c.id
      WHERE p.status = 'pending'
        AND DATE(p.due_date) = ?
        AND c.status != 'suspended'
    `, [tresDiasDepois.toISOString().split('T')[0]]);
    
    for (const pagamento of pagamentos3Dias) {
      const mensagem = `⚠️ *Lembrete de Vencimento*

Olá ${pagamento.name}!

Sua assinatura do Revendas vence em *3 dias*!

📅 *Data:* ${new Date(pagamento.due_date).toLocaleDateString('pt-BR')}
💰 *Valor:* R$ ${pagamento.amount.toFixed(2)}

Para evitar suspensão do serviço, realize o pagamento até a data.

_Precisa de ajuda? Responda esta mensagem!_`;
      
      await sendWhatsAppMessage(pagamento.whatsapp, mensagem);
      console.log(`📞 Lembrete 3 dias enviado para ${pagamento.whatsapp}`);
    }
    
    // --- NO DIA DO VENCIMENTO ---
    const [pagamentosHoje] = await pool.execute(`
      SELECT p.*, c.name, c.whatsapp, c.plan
      FROM revendas_payments p
      JOIN revendas_clients c ON p.client_id = c.id
      WHERE p.status = 'pending'
        AND DATE(p.due_date) = ?
        AND c.status != 'suspended'
    `, [hoje.toISOString().split('T')[0]]);
    
    for (const pagamento of pagamentosHoje) {
      const mensagem = `🚨 *Vencimento HOJE!*

Olá ${pagamento.name}!

Sua assinatura do Revendas vence *HOJE*!

💰 *Valor:* R$ ${pagamento.amount.toFixed(2)}

Realize o pagamento hoje para evitar suspensão do serviço.

_Responda esta mensagem se precisar de ajuda!_`;
      
      await sendWhatsAppMessage(pagamento.whatsapp, mensagem);
      console.log(`📞 Lembrete dia vencimento enviado para ${pagamento.whatsapp}`);
    }
    
    // --- 3 DIAS APÓS VENCIMENTO (SUSPENSÃO) ---
    const tresDiasAtras = new Date(hoje);
    tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
    
    const [pagamentosAtrasados] = await pool.execute(`
      SELECT p.*, c.name, c.whatsapp, c.plan
      FROM revendas_payments p
      JOIN revendas_clients c ON p.client_id = c.id
      WHERE p.status = 'pending'
        AND DATE(p.due_date) = ?
        AND c.status != 'suspended'
    `, [tresDiasAtras.toISOString().split('T')[0]]);
    
    for (const pagamento of pagamentosAtrasados) {
      // Suspender instância
      await pool.execute(
        'UPDATE revendas_clients SET status = ? WHERE id = ?',
        ['suspended', pagamento.client_id]
      );
      
      await pool.execute(
        'UPDATE revendas_instances SET status = ? WHERE client_id = ?',
        ['suspended', pagamento.client_id]
      );
      
      const mensagem = `⛔ *Serviço Suspenso*

Olá ${pagamento.name}!

Sua assinatura do Revendas foi *suspensa* por falta de pagamento.

Para reativar seu serviço:
1️⃣ Realize o pagamento de R$ ${pagamento.amount.toFixed(2)}
2️⃣ Envie o comprovante nesta conversa

_Seu site está temporariamente indisponível._`;
      
      await sendWhatsAppMessage(pagamento.whatsapp, mensagem);
      console.log(`⛔ Cliente ${pagamento.whatsapp} suspenso`);
    }
    
    console.log(`✅ Verificação concluída: ${pagamentos3Dias.length} lembretes 3 dias, ${pagamentosHoje.length} lembretes dia, ${pagamentosAtrasados.length} suspensões`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar vencimentos:', error);
  }
}

// Executar verificação a cada hora (verifica se é hora de rodar)
const ULTIMA_VERIFICACAO_FILE = '/tmp/revendas_ultima_verificacao.txt';
let verificarInterval;

function iniciarSistemaLembretes() {
  // Verificar a cada 1 hora
  verificarInterval = setInterval(async () => {
    const agora = new Date();
    const hora = agora.getHours();
    
    // Só executa entre 9h e 18h (horário comercial)
    if (hora >= 9 && hora < 18) {
      // Verificar se já rodou hoje
      let ultimaVerificacao = null;
      try {
        if (fs.existsSync(ULTIMA_VERIFICACAO_FILE)) {
          ultimaVerificacao = fs.readFileSync(ULTIMA_VERIFICACAO_FILE, 'utf8');
        }
      } catch (e) {}
      
      const hojeStr = agora.toISOString().split('T')[0];
      
      if (ultimaVerificacao !== hojeStr) {
        await verificarVencimentos();
        fs.writeFileSync(ULTIMA_VERIFICACAO_FILE, hojeStr);
      }
    }
  }, 60 * 60 * 1000); // 1 hora
  
  // Executar imediatamente ao iniciar (após 5 segundos)
  setTimeout(async () => {
    const agora = new Date();
    const hojeStr = agora.toISOString().split('T')[0];
    
    // Só executa se ainda não rodou hoje
    let ultimaVerificacao = null;
    try {
      if (fs.existsSync(ULTIMA_VERIFICACAO_FILE)) {
        ultimaVerificacao = fs.readFileSync(ULTIMA_VERIFICACAO_FILE, 'utf8');
      }
    } catch (e) {}
    
    if (ultimaVerificacao !== hojeStr) {
      await verificarVencimentos();
      fs.writeFileSync(ULTIMA_VERIFICACAO_FILE, hojeStr);
    }
  }, 5000);
  
  console.log('⏰ Sistema de lembretes automáticos iniciado');
}

// ============================================
// ROTA MANUAL PARA DISPARAR LEMBRETES (ADMIN)
// ============================================

app.post('/api/saas/admin/verificar-vencimentos', async (req, res) => {
  try {
    await verificarVencimentos();
    res.json({ success: true, message: 'Verificação de vencimentos executada!' });
  } catch (error) {
    console.error('Erro ao executar verificação:', error);
    res.status(500).json({ success: false, message: 'Erro ao executar verificação' });
  }
});

// --- FINAL FIX FOR PathError ---
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 SaaS Revendas API ativa`);
  
  // Iniciar sistema de lembretes
  iniciarSistemaLembretes();
});
