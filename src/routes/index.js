const express = require('express');
const authRoutes = require('./authRoutes');
const workoutRoutes = require('./workoutRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

router.use('/auth', authLimiter, authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
