import os

app_file = 'server/app.js'
with open(app_file, 'r') as f:
    app_content = f.read()

# Add rate limiter import
app_content = app_content.replace("const helmet = require('helmet');", "const helmet = require('helmet');\nconst rateLimit = require('express-rate-limit');")

# Add auth rate limiter before auth routes
auth_limiter = """
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);"""

app_content = app_content.replace("// Routes\napp.use('/api/auth', authRoutes);", auth_limiter)

with open(app_file, 'w') as f:
    f.write(app_content)
