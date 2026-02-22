const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth'); 

const app = express();
const PORT = process.env.PORT || 4001;

app.use(helmet());

// CORS 
app.use(cors());

// Body parsing 
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging 
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting 
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Routes 
app.use('/', authRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const connectWithRetry = () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/auth-db';
  console.log('⏳ Connecting to MongoDB...');
  mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Auth-Service connected to MongoDB'))
    .catch((err) => {
      console.error('❌ MongoDB connection failed, retrying in 5s:', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Auth Service listening on 0.0.0.0:${PORT}`);
});

connectWithRetry();

process.on('SIGTERM', () => {
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;