const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { checkConnection, autoSeedIfEmpty, ensureUserAuthSchema } = require('./config/db');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api', apiRouter);

// Serve static frontend files (root & pages directory)
app.use(express.static(path.join(__dirname, 'pages'), { extensions: ['html', 'htm'] }));
app.use(express.static(__dirname, { extensions: ['html', 'htm'] }));

// Pretty URL Routes for pages/
const pageRoutes = [
  'dashboard', 'signin', 'register', 'forgot-password', 'reset-password',
  'advanced-filters', 'advanced-search', 'my-garden', 'settings', 'study-notes'
];

pageRoutes.forEach(p => {
  app.get(`/${p}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', `${p}.html`));
  });
});

// Root gateway
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 Error Handler
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({ status: 'error', message: 'Endpoint or resource not found' });
  } else {
    res.status(404).type('txt').send('404 Not Found');
  }
});

// Run DB check & auth schema migration
(async () => {
  const isConnected = await checkConnection();
  if (isConnected) {
    await autoSeedIfEmpty();
    await ensureUserAuthSchema();
  }
})();

// Start Server for Local Execution
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`==================================================`);
    console.log(`🌱 Vatika Sanctuary Server is running on port ${PORT}`);
    console.log(`🌐 Web App: http://localhost:${PORT}/dashboard.html`);
    console.log(`🔌 API Endpoint: http://localhost:${PORT}/api/status`);
    console.log(`==================================================`);
  });
}

module.exports = app;
