
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
// If APP_NAME env var is set (e.g., 'site1'), data is stored in /data/site1/
// This prevents conflict when multiple apps share the same volume.
const APP_NAME = process.env.APP_NAME || ''; 

// Configuração de Pastas
const BASE_DATA_DIR = path.join(__dirname, 'data');
const DATA_DIR = path.join(BASE_DATA_DIR, APP_NAME); // /app/data/site1 OR /app/data/
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
// We create Base first, then the App specific folder
if (!fs.existsSync(BASE_DATA_DIR)) {
  try { fs.mkdirSync(BASE_DATA_DIR, { recursive: true }); } catch(e) {}
}
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {
    console.error(`FATAL: Could not create data directory at ${DATA_DIR}`, e);
    process.exit(1); // Force restart if we can't write
  }
}
if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch(e) {}
}

// Middleware
app.use(express.json({ limit: '50mb' })); // Limit for JSON data
app.use(express.static(path.join(__dirname, 'dist')));

// Serve uploaded images statically. 
// Note: We mount it to /uploads regardless of the internal folder structure
// so the frontend code (which expects /uploads/xyz.jpg) doesn't break.
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Multer Configuration (File Uploads) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

// --- Database Helper (Stabilized) ---
const getDefaults = () => ({ leads: [], plans: [], content: {} });

const readDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    return getDefaults();
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    if (!data.trim()) return getDefaults(); // Handle empty file
    return JSON.parse(data);
  } catch (err) {
    console.error(`CRITICAL: Error reading DB at ${DB_FILE}.`, err);
    // Backup corrupted file for manual inspection
    try {
        fs.copyFileSync(DB_FILE, `${DB_FILE}.corrupted.${Date.now()}`);
    } catch (e) { console.error("Could not backup corrupted DB"); }
    
    return getDefaults(); // Return defaults to keep server alive
  }
};

const writeDb = (data) => {
  try {
    // Atomic Write: Write to temp file first, then rename.
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error(`Error writing to DB at ${DB_FILE}:`, err);
  }
};

// --- API Routes ---

// Health Check for EasyPanel/Docker
app.get('/health', (req, res) => {
  // Check if we can write to disk (essential for this app)
  try {
      fs.accessSync(DATA_DIR, fs.constants.W_OK);
      res.status(200).send('OK');
  } catch (err) {
      res.status(500).send('Storage Error');
  }
});

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Return the URL to access the file
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Get all data
app.get('/api/db', (req, res) => {
  const data = readDb();
  res.json(data);
});

// Update Configuration (Content & Plans)
app.post('/api/config', (req, res) => {
  try {
      const { content, plans } = req.body;
      const db = readDb();
      
      if (content) db.content = content;
      if (plans) db.plans = plans;
      
      writeDb(db);
      res.json({ success: true });
  } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Add Lead
app.post('/api/leads', (req, res) => {
  try {
      const newLead = req.body;
      const db = readDb();
      
      // Initialize leads array if it doesn't exist
      if (!db.leads) db.leads = [];

      // Check duplicate
      const exists = db.leads.some(l => l.whatsapp === newLead.whatsapp);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Duplicate' });
      }

      db.leads.unshift(newLead); // Add to top
      writeDb(db);
      res.json({ success: true, lead: newLead });
  } catch (error) {
      console.error("Error adding lead:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update/Delete Lead
app.post('/api/leads/update', (req, res) => {
    try {
        const { id, action, data } = req.body; // action: 'update' or 'delete'
        const db = readDb();
        if (!db.leads) db.leads = [];

        if (action === 'delete') {
            db.leads = db.leads.filter(l => l.id !== id);
        } else if (action === 'update') {
            db.leads = db.leads.map(l => l.id === id ? { ...l, ...data } : l);
        }

        writeDb(db);
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating lead:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// --- Catch All -> Serve React App ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using App Name: "${APP_NAME}"`);
  console.log(`Database file located at: ${DB_FILE}`);
  console.log(`Uploads directory located at: ${UPLOADS_DIR}`);
});
