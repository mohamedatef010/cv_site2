const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

try {
  require('dotenv').config();
} catch (_) {
  // dotenv is optional
}

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_ROOT = __dirname;

// Persistent storage paths (use DATA_ROOT on server for data that survives redeploys)
const DATA_ROOT = process.env.DATA_ROOT
  ? path.resolve(process.env.DATA_ROOT)
  : APP_ROOT;
const LEGACY_DATA_FILE = path.join(APP_ROOT, 'data.json');
const PERSISTENT_DATA_FILE = path.join(DATA_ROOT, 'site-data.json');

function resolveDataFile() {
  if (process.env.DATA_FILE) {
    return path.resolve(process.env.DATA_FILE);
  }
  if (DATA_ROOT !== APP_ROOT) {
    return PERSISTENT_DATA_FILE;
  }
  return LEGACY_DATA_FILE;
}

const DATA_FILE = resolveDataFile();
const DATA_BACKUP_FILE = DATA_FILE + '.bak';

const IMG_ROOT = process.env.IMG_ROOT
  ? path.resolve(process.env.IMG_ROOT)
  : (DATA_ROOT !== APP_ROOT ? path.join(DATA_ROOT, 'img') : path.join(APP_ROOT, 'img'));

const portfolioDir = path.join(IMG_ROOT, 'portfolio');
const awardsDir = path.join(IMG_ROOT, 'awards');
const testimonialsDir = path.join(IMG_ROOT, 'testimonials');

// Admin credentials — set via environment on production server
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_password_123';
const SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || 'admin-session-token-998877';

if (NODE_ENV === 'production' && ADMIN_PASSWORD === 'admin_password_123') {
  console.warn('WARNING: Set ADMIN_PASSWORD in environment variables before going live.');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  if (req.path === '/data.json' || req.path === '/api/data') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function canWriteDir(dirPath) {
  try {
    ensureDir(dirPath);
    const probe = path.join(dirPath, '.write-test');
    fs.writeFileSync(probe, 'ok', 'utf8');
    fs.unlinkSync(probe);
    return true;
  } catch (err) {
    console.error(`Cannot write to directory: ${dirPath}`, err.message);
    return false;
  }
}

function initializeStorage() {
  ensureDir(DATA_ROOT);
  ensureDir(IMG_ROOT);
  ensureDir(portfolioDir);
  ensureDir(awardsDir);
  ensureDir(testimonialsDir);

  if (!canWriteDir(path.dirname(DATA_FILE))) {
    throw new Error(`Data directory is not writable: ${path.dirname(DATA_FILE)}`);
  }
  if (!canWriteDir(IMG_ROOT)) {
    throw new Error(`Image directory is not writable: ${IMG_ROOT}`);
  }

  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(LEGACY_DATA_FILE)) {
      fs.copyFileSync(LEGACY_DATA_FILE, DATA_FILE);
      console.log(`Copied existing data from ${LEGACY_DATA_FILE} to ${DATA_FILE}`);
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf8');
      console.log(`Created new data file: ${DATA_FILE}`);
    }
  }

  console.log('Storage ready:');
  console.log(`  DATA_FILE: ${DATA_FILE}`);
  console.log(`  IMG_ROOT:  ${IMG_ROOT}`);
}

// Helper to read persisted site data
const getData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return {};
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  if (!raw.trim()) {
    return {};
  }
  return JSON.parse(raw);
};

// Atomic write + backup so data is never corrupted mid-save
const saveData = (data) => {
  const content = JSON.stringify(data, null, 2);
  const tempPath = DATA_FILE + '.tmp';

  if (fs.existsSync(DATA_FILE)) {
    try {
      fs.copyFileSync(DATA_FILE, DATA_BACKUP_FILE);
    } catch (err) {
      console.warn('Could not create data backup:', err.message);
    }
  }

  fs.writeFileSync(tempPath, content, 'utf8');
  fs.renameSync(tempPath, DATA_FILE);
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const subfolder = req.query.folder || '';
    let dest = IMG_ROOT;
    if (subfolder === 'portfolio') {
      dest = portfolioDir;
    } else if (subfolder === 'awards') {
      dest = awardsDir;
    } else if (subfolder === 'testimonials') {
      dest = testimonialsDir;
    }
    ensureDir(dest);
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const filename = baseName + '_' + Date.now() + ext;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG, BMP) or video files (MP4, WebM, MOV, AVI, MKV) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader === `Bearer ${SESSION_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized access. Please log in.' });
  }
};

function isValidSiteData(payload) {
  return payload && typeof payload === 'object' && !Array.isArray(payload);
}

// --- API Endpoints (registered before static files) ---

app.get('/api/health', (req, res) => {
  const writable = canWriteDir(path.dirname(DATA_FILE));
  res.json({
    ok: true,
    env: NODE_ENV,
    dataFile: DATA_FILE,
    imgRoot: IMG_ROOT,
    writable
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: SESSION_TOKEN });
  } else {
    res.status(400).json({ success: false, message: 'Incorrect username or password!' });
  }
});

app.get('/api/data', (req, res) => {
  try {
    const data = getData();
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ success: false, message: 'Failed to load data.' });
  }
});

// Legacy path — always serves live data from server storage
app.get('/data.json', (req, res) => {
  try {
    const data = getData();
    res.json(data);
  } catch (error) {
    console.error('Error reading data.json:', error);
    res.status(500).json({ success: false, message: 'Failed to load data.' });
  }
});

app.post('/api/save', authenticateAdmin, (req, res) => {
  try {
    const newData = req.body;
    if (!isValidSiteData(newData)) {
      return res.status(400).json({ success: false, message: 'Invalid data payload.' });
    }
    saveData(newData);
    console.log(`Site data saved (${DATA_FILE})`);
    res.json({ success: true, message: 'Website content updated successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ success: false, message: 'Failed to save changes. Check server write permissions.' });
  }
});

app.post('/api/upload', authenticateAdmin, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: 'Upload error: ' + err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded. Please select an image or video file.' });
    }

    const subfolder = req.query.folder || '';
    let relativePath;
    if (subfolder === 'portfolio') {
      relativePath = 'img/portfolio/' + req.file.filename;
    } else if (subfolder === 'awards') {
      relativePath = 'img/awards/' + req.file.filename;
    } else if (subfolder === 'testimonials') {
      relativePath = 'img/testimonials/' + req.file.filename;
    } else {
      relativePath = 'img/' + req.file.filename;
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    console.log(`${isVideo ? 'Video' : 'Image'} uploaded: ${relativePath} (${req.file.size} bytes)`);
    res.json({ success: true, imagePath: relativePath, fileName: req.file.filename, type: isVideo ? 'video' : 'image' });
  });
});

// Uploaded images (persistent storage on server)
app.use('/img', express.static(IMG_ROOT, { maxAge: NODE_ENV === 'production' ? '7d' : 0 }));

// Static site assets (html, css, js)
app.use(express.static(APP_ROOT, { index: 'index.html' }));

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

initializeStorage();

const server = app.listen(PORT, () => {
  console.log('=========================================');
  console.log('  Profile Website Server is running!');
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Admin: http://localhost:${PORT}/admin.html`);
  console.log('=========================================');
});

server.timeout = 600000;
server.keepAliveTimeout = 620000;
server.headersTimeout = 660000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
