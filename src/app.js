const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorHandler');

const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// CORS Configuration
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:3000'),
  optionsSuccessStatus: 200
}));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Routes
app.use('/api', routes);


// Health Check
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
  res.status(200).json({
    success: true,
    message: 'FitSense API is running',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: "FitSense API Root",
    apiLink: "http://localhost:5000/api",
    healthCheck: "http://localhost:5000/api/health",
    databaseStatus: mongoose.connection.readyState === 1 ? "Connected to MongoDB" : "Disconnected",
    databaseHost: mongoose.connection.host || 'unknown'
  });
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;

const connectDB = require('./config/db');

const startServer = async () => {
  try {
    console.log('\n=============================================');
    console.log('🚀 FitSense API starting...');
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server is actively running and listening!`);
      console.log(`🌐 HTTP Link: http://localhost:${PORT}`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log('=============================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
