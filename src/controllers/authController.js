const User = require('../models/User');
const bcrypt = require('bcryptjs');
const hashPassword = async (password) => { const salt = await bcrypt.genSalt(10); return await bcrypt.hash(password, salt); };
const comparePassword = async (enteredPassword, hashedPassword) => { return await bcrypt.compare(enteredPassword, hashedPassword); };
const jwt = require('jsonwebtoken');
const generateToken = (userId) => { return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }); };
const { successResponse } = require('../middleware/errorHandler');
const { ValidationError, UnauthorizedError } = require('../middleware/errorHandler');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ValidationError('Email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id);

    return successResponse(res, 'User registered successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      token
    }, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken(user._id);

    return successResponse(res, 'Login successful', {
      id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, 'Profile retrieved successfully', {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
