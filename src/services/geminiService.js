const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const { APIError } = require('../middleware/errorHandler');

// Initialize GoogleGenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getRecommendation = async ({ age, fitnessGoal, experienceLevel }) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      throw new APIError('Gemini API key is not configured.', 500);
  }

  const prompt = `
You are a fitness recommendation assistant.
Generate a practical and safe workout recommendation based on:
Age: ${age}
Fitness Goal: ${fitnessGoal}
Experience Level: ${experienceLevel}

Provide a structured weekly workout plan.
Consider:
- training frequency
- exercise selection
- sets
- repetitions
- rest periods
- progression
- recovery
- safety

Do not diagnose medical conditions.
Do not provide dangerous recommendations.
Recommend professional guidance when necessary.

Return ONLY structured JSON matching this schema, without any markdown formatting or comments:
{
  "goal": "string",
  "experienceLevel": "string",
  "weeklyPlan": [
    {
      "day": "string",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": number
        }
      ]
    }
  ],
  "tips": ["string"],
  "safety": ["string"]
}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    // Strip markdown formatting if the model still includes it
    let jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new APIError('Failed to generate AI recommendation', 502);
  }
};

const getInsights = async ({ totalWorkouts, averageWorkoutDuration, totalCaloriesBurned }) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      throw new APIError('Gemini API key is not configured.', 500);
  }
  
  const prompt = `
You are a fitness analysis assistant.
Analyze these statistics and generate insights:
Total Workouts: ${totalWorkouts}
Average Workout Duration: ${averageWorkoutDuration} minutes
Total Calories Burned: ${totalCaloriesBurned}

Generate:
- performance summary
- consistency analysis
- improvement suggestions
- training recommendations
- motivational guidance

Do not diagnose medical conditions.
Recommend professional guidance when necessary.

Return ONLY structured JSON matching this schema, without any markdown formatting or comments:
{
  "performanceSummary": "string",
  "consistencyAnalysis": "string",
  "improvementSuggestions": ["string"],
  "trainingRecommendations": ["string"],
  "motivation": "string"
}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    let jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new APIError('Failed to generate AI insights', 502);
  }
};

module.exports = {
  getRecommendation,
  getInsights
};
