// Script para criar as tabelas do SaaS Revendas
import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'automacao_saasql',
  user: 'toligado',
  password: 'Naodigo2306@',
  database: 'saasql'
};

const CREATE_TABLES = `
-- Tabela de clientes
CREATE TABLE IF NOT EXISTS revendas_clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  whatsapp VARCHAR(20),
  plan ENUM('parceiro', 'basico', 'premium'),
  status ENUM('trial', 'active', 'expired'),
  has_funcionario BOOLEAN DEFAULT FALSE,
  trial_ends_at DATETIME,
  subscription_ends_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de instâncias (cada cliente tem sua landing)
CREATE TABLE IF NOT EXISTS revendas_instances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  subdomain VARCHAR(100),
  custom_domain VARCHAR(255),
  status ENUM('active', 'suspended'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES revendas_clients(id) ON DELETE CASCADE
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS revendas_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  amount DECIMAL(10,2),
  status ENUM('pending', 'paid', 'overdue'),
  due_date DATE,
  paid_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES revendas_clients(id) ON DELETE CASCADE
);
`;

async function initDatabase() {
  let connection;
  try {
    console.log('Conectando ao MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('Conectado com sucesso!');
    
    // Executar cada CREATE TABLE separadamente
    const tables = CREATE_TABLES.split(';').filter(t => t.trim());
    for (const table of tables) {
      if (table.trim()) {
        await connection.execute(table);
      }
    }
    
    console.log('Tabelas criadas/verificadas com sucesso!');
    
    // Listar tabelas
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tabelas existentes:', rows);
    
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
