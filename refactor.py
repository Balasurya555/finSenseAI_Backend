import os
import shutil
import re

base_dir = "/Users/mac1/Documents/projects/FitSense "

# 1. Create structure
src_dir = os.path.join(base_dir, "src")
os.makedirs(os.path.join(src_dir, "config"), exist_ok=True)
os.makedirs(os.path.join(src_dir, "controllers"), exist_ok=True)
os.makedirs(os.path.join(src_dir, "middleware"), exist_ok=True)
os.makedirs(os.path.join(src_dir, "models"), exist_ok=True)
os.makedirs(os.path.join(src_dir, "routes"), exist_ok=True)
os.makedirs(os.path.join(src_dir, "services"), exist_ok=True)

# 2. Move basic files
shutil.copy(os.path.join(base_dir, "server/config/db.js"), os.path.join(src_dir, "config/db.js"))
shutil.copy(os.path.join(base_dir, "server/models/User.js"), os.path.join(src_dir, "models/User.js"))
shutil.copy(os.path.join(base_dir, "server/models/Workout.js"), os.path.join(src_dir, "models/Workout.js"))
shutil.copy(os.path.join(base_dir, "server/services/geminiService.js"), os.path.join(src_dir, "services/geminiService.js"))

# 3. Refactor config/env.js to just use process.env
# Actually, the original code used config/env.js. We can just replace env.VAR with process.env.VAR across the codebase.
def replace_env(content):
    content = re.sub(r'const \{ env \} = require\([\'"].*?env.*?.js[\'"]\);', "require('dotenv').config();", content)
    content = content.replace("env.PORT", "(process.env.PORT || 5000)")
    content = content.replace("env.MONGO_URI", "process.env.MONGO_URI")
    content = content.replace("env.JWT_SECRET", "process.env.JWT_SECRET")
    content = content.replace("env.JWT_EXPIRES_IN", "(process.env.JWT_EXPIRES_IN || '7d')")
    content = content.replace("env.GEMINI_API_KEY", "process.env.GEMINI_API_KEY")
    content = content.replace("env.CLIENT_URL", "(process.env.CLIENT_URL || 'http://localhost:3000')")
    return content

# 4. Refactor utils/apiResponse.js and utils/errors.js logic into where it's used.
# Or just put them in errorHandler.js
error_handler = """const { validationResult } = require('express-validator');

class APIError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends APIError {
  constructor(message) { super(message, 400); }
}
class NotFoundError extends APIError {
  constructor(message = 'Resource not found') { super(message, 404); }
}
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') { super(message, 401); }
}
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden access') { super(message, 403); }
}

const successResponse = (res, message, data = null, statusCode = 200, extra = {}) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json({ ...response, ...extra });
};

const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = { success: false, message };
  if (error !== null) response.error = error;
  return res.status(statusCode).json(response);
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', errors.array(), 400);
  }
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, 'Validation failed', messages, 400);
  }
  if (err.code === 11000) return errorResponse(res, 'Duplicate field value entered', err.keyValue, 400);
  if (err.name === 'CastError') return errorResponse(res, `Resource not found with id of ${err.value}`, null, 404);
  if (err.name === 'JsonWebTokenError') return errorResponse(res, 'Unauthorized', 'Invalid token', 401);
  if (err.name === 'TokenExpiredError') return errorResponse(res, 'Unauthorized', 'Token expired', 401);
  if (err instanceof APIError) return errorResponse(res, err.message, null, err.statusCode);
  return errorResponse(res, 'Internal Server Error', null, 500);
};

module.exports = { errorHandler, successResponse, errorResponse, validateRequest, APIError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError };
"""
with open(os.path.join(src_dir, "middleware/errorHandler.js"), 'w') as f:
    f.write(error_handler)

# 5. Refactor db.js
with open(os.path.join(base_dir, "server/config/db.js"), 'r') as f:
    db = f.read()
db = replace_env(db)
with open(os.path.join(src_dir, "config/db.js"), 'w') as f:
    f.write(db)

# 6. Refactor controllers
for c_name in ["authController.js", "workoutController.js", "aiController.js"]:
    with open(os.path.join(base_dir, "server/controllers", c_name), 'r') as f:
        content = f.read()
    
    # Update imports
    content = re.sub(r"require\('\.\./utils/apiResponse'\)", "require('../middleware/errorHandler')", content)
    content = re.sub(r"require\('\.\./utils/errors'\)", "require('../middleware/errorHandler')", content)
    
    # Inline password/jwt service in authController
    if c_name == "authController.js":
        content = content.replace("const { hashPassword, comparePassword } = require('../services/passwordService');", 
                                  "const bcrypt = require('bcryptjs');\nconst hashPassword = async (password) => { const salt = await bcrypt.genSalt(10); return await bcrypt.hash(password, salt); };\nconst comparePassword = async (enteredPassword, hashedPassword) => { return await bcrypt.compare(enteredPassword, hashedPassword); };")
        content = content.replace("const { generateToken } = require('../services/jwtService');", 
                                  "const jwt = require('jsonwebtoken');\nconst generateToken = (userId) => { return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }); };")
    
    with open(os.path.join(src_dir, "controllers", c_name), 'w') as f:
        f.write(content)

# 7. Refactor routes
for r_name in ["authRoutes.js", "workoutRoutes.js", "aiRoutes.js"]:
    with open(os.path.join(base_dir, "server/routes", r_name), 'r') as f:
        content = f.read()
    
    content = re.sub(r"require\('\.\./middleware/authMiddleware'\)", "require('../middleware/auth')", content)
    content = re.sub(r"require\('\.\./middleware/validationMiddleware'\)", "require('../middleware/errorHandler')", content)
    
    with open(os.path.join(src_dir, "routes", r_name), 'w') as f:
        f.write(content)

# 8. Create routes/index.js
index_content = """const express = require('express');
const authRoutes = require('./authRoutes');
const workoutRoutes = require('./workoutRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
"""
with open(os.path.join(src_dir, "routes/index.js"), 'w') as f:
    f.write(index_content)

# 9. Refactor authMiddleware.js -> auth.js
with open(os.path.join(base_dir, "server/middleware/authMiddleware.js"), 'r') as f:
    content = f.read()

content = content.replace("const { verifyToken } = require('../services/jwtService');", "const jwt = require('jsonwebtoken');\nconst verifyToken = (token) => { return jwt.verify(token, process.env.JWT_SECRET); };")
content = re.sub(r"require\('\.\./utils/errors'\)", "require('./errorHandler')", content)

with open(os.path.join(src_dir, "middleware/auth.js"), 'w') as f:
    f.write(content)

# 10. Refactor geminiService.js
with open(os.path.join(base_dir, "server/services/geminiService.js"), 'r') as f:
    content = f.read()
content = replace_env(content)
content = re.sub(r"require\('\.\./utils/errors'\)", "require('../middleware/errorHandler')", content)
with open(os.path.join(src_dir, "services/geminiService.js"), 'w') as f:
    f.write(content)

# 11. Refactor app.js
with open(os.path.join(base_dir, "server/app.js"), 'r') as f:
    content = f.read()

content = replace_env(content)
content = content.replace("const { errorHandler } = require('./middleware/errorMiddleware');", "const { errorHandler } = require('./middleware/errorHandler');")
content = re.sub(r"const authRoutes = require\('\./routes/authRoutes'\);\nconst workoutRoutes = require\('\./routes/workoutRoutes'\);\nconst aiRoutes = require\('\./routes/aiRoutes'\);", "const routes = require('./routes');", content)

content = content.replace("app.use('/api/auth', authLimiter, authRoutes);", "app.use('/api', routes);")
content = content.replace("app.use('/api/workouts', workoutRoutes);\napp.use('/api/ai', aiRoutes);", "")

# Bring the startup logic from server.js into app.js
content += """
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    console.log('FitSense API starting...');
    await connectDB();
    
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
"""

with open(os.path.join(src_dir, "app.js"), 'w') as f:
    f.write(content)

# 12. Update package.json
with open(os.path.join(base_dir, "server/package.json"), 'r') as f:
    pkg = f.read()
pkg = pkg.replace("node server.js", "node src/app.js")
pkg = pkg.replace("nodemon server.js", "nodemon src/app.js")
with open(os.path.join(base_dir, "package.json"), 'w') as f:
    f.write(pkg)
    
# Copy package-lock.json and node_modules
# It's better to just install again in root
