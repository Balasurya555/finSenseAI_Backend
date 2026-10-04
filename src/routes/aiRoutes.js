const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const { generateRecommendation, generateInsights } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

const recommendationValidation = [
  body('age').isInt({ min: 1 }).withMessage('Valid age is required'),
  body('fitnessGoal').notEmpty().withMessage('Fitness goal is required'),
  body('experienceLevel').notEmpty().withMessage('Experience level is required')
];

const insightsValidation = [
  body('totalWorkouts').isInt({ min: 0 }).withMessage('Valid total workouts required'),
  body('averageWorkoutDuration').isFloat({ min: 0 }).withMessage('Valid average duration required'),
  body('totalCaloriesBurned').isFloat({ min: 0 }).withMessage('Valid total calories required')
];

router.post('/recommendation', recommendationValidation, validateRequest, generateRecommendation);
router.post('/insights', insightsValidation, validateRequest, generateInsights);

module.exports = router;
