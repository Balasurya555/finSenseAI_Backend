const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  searchWorkouts
} = require('../controllers/workoutController');

const router = express.Router();

router.use(protect); // All workout routes are protected

const workoutValidation = [
  body('workoutName').notEmpty().withMessage('Workout name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('duration').isFloat({ min: 1 }).withMessage('Duration must be greater than 0'),
  body('caloriesBurned').optional().isFloat({ min: 0 }).withMessage('Calories burned must be at least 0'),
  body('workoutDate').isISO8601().toDate().withMessage('Valid workout date is required')
];

router.post('/', workoutValidation, validateRequest, createWorkout);
router.get('/', getWorkouts);
router.get('/search', searchWorkouts);
router.get('/:id', getWorkoutById);
router.put('/:id', workoutValidation, validateRequest, updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
