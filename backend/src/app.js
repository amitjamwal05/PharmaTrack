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

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'PharmaTrack API is running' });
});

// Start cron jobs
require('./services/expiryAlertCron')();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
