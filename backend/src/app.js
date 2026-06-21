const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/superadmin', require('./routes/superadminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'PharmaTrack API is running' });
});

// Ultra-lightweight endpoint specifically for Render keep-awake
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start cron jobs
require('./services/expiryAlertCron')();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Self-ping logic to keep Render awake natively
  const https = require('https');
  setInterval(() => {
    https.get('https://pharmatrack-xqr3.onrender.com/api/ping', (res) => {
      console.log(`[Self-Ping] Keep-awake successful! Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[Self-Ping] Keep-awake failed:', err.message);
    });
  }, 14 * 60 * 1000); // Ping every 14 minutes
  
  console.log('Self-ping keep-awake cron initialized (14m interval).');
});
