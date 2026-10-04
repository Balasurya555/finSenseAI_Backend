const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`📦 MongoDB Connected Successfully!`);
    console.log(`🔌 Database Host: ${conn.connection.host}`);
    console.log(`🔗 Connection URI: ${process.env.MONGO_URI}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error('MongoDB connection failed');
  }
};

module.exports = connectDB;
