import os

app_file = 'server/app.js'
with open(app_file, 'r') as f:
    app_content = f.read()

app_content = "const mongoose = require('mongoose');\n" + app_content

old_health = """// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FitSense API is running',
    timestamp: new Date().toISOString()
  });
});"""

new_health = """// Health Check
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
  res.status(200).json({
    success: true,
    message: 'FitSense API is running',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});"""

app_content = app_content.replace(old_health, new_health)

with open(app_file, 'w') as f:
    f.write(app_content)

db_file = 'server/config/db.js'
with open(db_file, 'r') as f:
    db_content = f.read()

db_content = db_content.replace("console.log(`MongoDB connected: ${conn.connection.host}`);", "console.log('MongoDB connected successfully');")
db_content = db_content.replace("process.exit(1);", "throw new Error('MongoDB connection failed');")

with open(db_file, 'w') as f:
    f.write(db_content)

server_file = 'server/server.js'
with open(server_file, 'r') as f:
    server_content = f.read()

server_content = server_content.replace("console.error('Failed to start server:', error);", "console.error('Failed to start server:', error.message);")

with open(server_file, 'w') as f:
    f.write(server_content)
