import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'automacao_saasql',
  user: 'toligado',
  password: 'Naodigo2306@',
  database: 'saasql',
  waitForConnections: true,
  connectionLimit: 10
};

async function createTables() {
  const pool = mysql.createPool(DB_CONFIG);
  
  try {
    console.log('📦 Criando tabelas de cobrança recorrente...\n');
    
    // Tabela de Assinaturas
    console.log('1. Criando tabela revendas_subscriptions...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS revendas_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        plan ENUM('parceiro', 'basico', 'premium') NOT NULL,
        status ENUM('active', 'pending', 'expired', 'cancelled') DEFAULT 'pending',
        start_date DATE,
        end_date DATE,
        last_payment_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES revendas_clients(id)
      )
    `);
    console.log('   ✅ revendas_subscriptions criada\n');
    
    // Tabela de Pagamentos
    console.log('2. Criando tabela revendas_payments (atualizando)...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS revendas_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        subscription_id INT,
        amount DECIMAL(10,2) NOT NULL,
        plan VARCHAR(50) NOT NULL,
        status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        pix_code TEXT,
        pix_qr_code TEXT,
        due_date DATE,
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES revendas_clients(id)
      )
    `);
    console.log('   ✅ revendas_payments criada\n');
    
    // Tabela de Lembretes
    console.log('3. Criando tabela revendas_reminders...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS revendas_reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        type ENUM('7days', '3days', '1day', 'expired') NOT NULL,
        send_date DATE NOT NULL,
        sent BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES revendas_clients(id)
      )
    `);
    console.log('   ✅ revendas_reminders criada\n');
    
    // Verificar se colunas existem em revendas_payments
    const [columns] = await pool.execute(`SHOW COLUMNS FROM revendas_payments LIKE 'subscription_id'`);
    if (columns.length === 0) {
      console.log('   Adicionando colunas faltantes...');
      try {
        await pool.execute(`ALTER TABLE revendas_payments ADD COLUMN subscription_id INT AFTER client_id`);
      } catch (e) {}
      try {
        await pool.execute(`ALTER TABLE revendas_payments ADD COLUMN plan VARCHAR(50) AFTER amount`);
      } catch (e) {}
      try {
        await pool.execute(`ALTER TABLE revendas_payments ADD COLUMN pix_code TEXT AFTER status`);
      } catch (e) {}
      try {
        await pool.execute(`ALTER TABLE revendas_payments ADD COLUMN pix_qr_code TEXT AFTER pix_code`);
      } catch (e) {}
      console.log('   ✅ Colunas adicionadas\n');
    }
    
    // Verificar tabelas existentes
    const [tables] = await pool.execute(`SHOW TABLES LIKE 'revendas%'`);
    console.log('📊 Tabelas revendas existentes:');
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));
    
    console.log('\n✅ Tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createTables();
