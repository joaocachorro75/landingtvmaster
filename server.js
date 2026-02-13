
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// --- MULTI-SITE ISOLATION LOGIC ---
const APP_NAME = process.env.APP_NAME || ''; 

// Configuração de Pastas
const BASE_DATA_DIR = path.join(__dirname, 'data');
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

// --- Database Helper ---
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

// --- API Routes ---

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

// --- FIX: Wildcard catch-all for SPA ---
// Using '/*' instead of '*' to avoid PathError in newer Express/path-to-regexp versions
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
