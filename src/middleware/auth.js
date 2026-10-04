const jwt = require('jsonwebtoken');
const verifyToken = (token) => { return jwt.verify(token, process.env.JWT_SECRET); };
const User = require('../models/User');
const { UnauthorizedError } = require('./errorHandler');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Unauthorized');
    }

    try {
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
         throw new UnauthorizedError('User not found');
      }
      next();
    } catch (error) {
      throw new UnauthorizedError('Unauthorized');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
