
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// Configuração de Pastas
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '50mb' })); // Limit for JSON data
app.use(express.static(path.join(__dirname, 'dist')));
// Serve uploaded images statically
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

// --- Database Helper ---
const readDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    return { leads: [], plans: [], content: {} };
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return { leads: [], plans: [], content: {} };
  }
};

const writeDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- API Routes ---

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
  const { content, plans } = req.body;
  const db = readDb();
  
  if (content) db.content = content;
  if (plans) db.plans = plans;
  
  writeDb(db);
  res.json({ success: true });
});

// Add Lead
app.post('/api/leads', (req, res) => {
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
});

// Update/Delete Lead
app.post('/api/leads/update', (req, res) => {
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
});

// --- Catch All -> Serve React App ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database file located at: ${DB_FILE}`);
  console.log(`Uploads directory located at: ${UPLOADS_DIR}`);
});
