const geminiService = require('../services/geminiService');
const { successResponse } = require('../middleware/errorHandler');

const generateRecommendation = async (req, res, next) => {
  try {
    const { age, fitnessGoal, experienceLevel } = req.body;
    
    const recommendation = await geminiService.getRecommendation({
      age,
      fitnessGoal,
      experienceLevel
    });
    
    return successResponse(res, 'AI recommendation generated successfully', recommendation);
  } catch (error) {
    next(error);
  }
};

const generateInsights = async (req, res, next) => {
  try {
    const { totalWorkouts, averageWorkoutDuration, totalCaloriesBurned } = req.body;
    
    const insights = await geminiService.getInsights({
      totalWorkouts,
      averageWorkoutDuration,
      totalCaloriesBurned
    });
    
    return successResponse(res, 'AI insights generated successfully', insights);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRecommendation,
  generateInsights
};
