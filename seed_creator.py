with open("server/seed.js", "w") as f:
    f.write("""const mongoose = require('mongoose');
const User = require('./models/User');
const Workout = require('./models/Workout');
const { env } = require('./config/env');
const { hashPassword } = require('./services/passwordService');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing data...');
    
    await User.deleteMany();
    await Workout.deleteMany();

    console.log('Creating test users...');
    const hashedPass = await hashPassword('StrongPassword123');
    
    const userA = await User.create({
      name: 'User A',
      email: 'usera@example.com',
      password: hashedPass
    });

    const userB = await User.create({
      name: 'User B',
      email: 'userb@example.com',
      password: hashedPass
    });

    console.log('Creating test workouts...');
    await Workout.create([
      {
        user: userA._id,
        workoutName: 'Morning Run',
        category: 'Cardio',
        duration: 30,
        caloriesBurned: 300,
        workoutDate: new Date()
      },
      {
        user: userA._id,
        workoutName: 'Evening Lifting',
        category: 'Strength',
        duration: 45,
        caloriesBurned: 200,
        workoutDate: new Date()
      },
      {
        user: userB._id,
        workoutName: 'Yoga',
        category: 'Flexibility',
        duration: 60,
        caloriesBurned: 150,
        workoutDate: new Date()
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
""")
