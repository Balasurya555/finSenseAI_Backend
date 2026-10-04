const Workout = require('../models/Workout');
const { successResponse } = require('../middleware/errorHandler');
const { NotFoundError } = require('../middleware/errorHandler');

const createWorkout = async (req, res, next) => {
  try {
    const { workoutName, category, duration, caloriesBurned, workoutDate } = req.body;

    const workout = await Workout.create({
      user: req.user._id,
      workoutName,
      category,
      duration,
      caloriesBurned,
      workoutDate
    });

    return successResponse(res, 'Workout created successfully', workout, 201);
  } catch (error) {
    next(error);
  }
};

const getWorkouts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { user: req.user._id };

    const total = await Workout.countDocuments(query);
    const workouts = await Workout.find(query)
      .sort({ workoutDate: -1 })
      .skip(startIndex)
      .limit(limit);

    const pages = Math.ceil(total / limit);

    return successResponse(res, 'Workouts retrieved successfully', workouts, 200, {
      page,
      limit,
      total,
      pages
    });
  } catch (error) {
    next(error);
  }
};

const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    return successResponse(res, 'Workout retrieved successfully', workout);
  } catch (error) {
    next(error);
  }
};

const updateWorkout = async (req, res, next) => {
  try {
    const { workoutName, category, duration, caloriesBurned, workoutDate } = req.body;

    let workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    workout.workoutName = workoutName || workout.workoutName;
    workout.category = category || workout.category;
    workout.duration = duration || workout.duration;
    workout.caloriesBurned = caloriesBurned || workout.caloriesBurned;
    workout.workoutDate = workoutDate || workout.workoutDate;

    await workout.save();

    return successResponse(res, 'Workout updated successfully', workout);
  } catch (error) {
    next(error);
  }
};

const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    return successResponse(res, 'Workout deleted successfully');
  } catch (error) {
    next(error);
  }
};

const searchWorkouts = async (req, res, next) => {
  try {
    const { name, category, date } = req.query;
    
    let query = { user: req.user._id };
    
    if (name) {
      query.workoutName = { $regex: name, $options: 'i' };
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (date) {
        const queryDate = new Date(date);
        const nextDate = new Date(queryDate);
        nextDate.setDate(nextDate.getDate() + 1);
        query.workoutDate = {
            $gte: queryDate,
            $lt: nextDate
        };
    }
    
    const workouts = await Workout.find(query).sort({ workoutDate: -1 });
    
    return successResponse(res, 'Search completed successfully', workouts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  searchWorkouts
};
