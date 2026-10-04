const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workoutName: {
    type: String,
    required: [true, 'Workout name is required'],
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be greater than 0']
  },
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories burned must be at least 0'],
    default: 0
  },
  workoutDate: {
    type: Date,
    required: [true, 'Workout date is required'],
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema);
