/**
 * Lab 1: Express Server Implementation
 * Course: Backend Development Fundamentals · Year II Term II · Aurora
 * Faculty: Joel Prashanth D
 * 
 * Tasks 4, 5, 6, 7:
 * - Express server setup (app = express(), app.listen(3000))
 * - Route GET / : Welcome text
 * - Route GET /about : JSON with name and section
 * - Route GET /time : Current date and time using new Date()
 * - Unknown route handler : 404 status code with error message
 * - Request logger : Logs status codes and routes accessed
 */

const express = require('express');

// Initialize express app (Task 4)
const app = express();

// Port configuration (reads from environment variable or defaults to 3000)
const PORT = process.env.PORT || 3000;

// Student details configuration (configurable via ENV or defaults)
const STUDENT_INFO = {
  name: process.env.STUDENT_NAME || 'G Sainadh Reddy',
  registrationNumber: process.env.STUDENT_REG_NO || '252U1R6076',
  section: process.env.STUDENT_SECTION || 'CSE 2B',
  course: 'Backend Development Fundamentals',
  yearTerm: 'Year II Term II',
  faculty: 'Joel Prashanth D',
  college: 'Aurora'
};

// Logging Middleware (Task 7): Logs route, method, and response status code
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Listen for the finish event on response to capture the final status code
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Task 5 - Route 1: GET / (welcome text)
app.get('/', (req, res) => {
  res.status(200).send('Welcome to Lab 1: Node.js and Express Server - Backend Development Fundamentals (Aurora)');
});

// Task 5 - Route 2: GET /about (JSON with name and section)
app.get('/about', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: STUDENT_INFO
  });
});

// Task 5 - Route 3: GET /time (current date and time using new Date())
app.get('/time', (req, res) => {
  const now = new Date();
  res.status(200).json({
    status: 'success',
    iso: now.toISOString(),
    utc: now.toUTCString(),
    local: now.toString(),
    timestamp: now.getTime()
  });
});

// Task 6: Return a 404 message for any unknown path
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl} - The requested route does not exist on this server.`,
    statusCode: 404,
    validEndpoints: [
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/about' },
      { method: 'GET', path: '/time' }
    ]
  });
});

// Start Express server on specified port (Task 4)
// Only starts listening when executed directly in local Node environment
if (require.main === module || (!process.env.VERCEL && process.env.NODE_ENV !== 'production')) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Express Server is running successfully!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`📍 Available Endpoints:`);
    console.log(`   - GET  http://localhost:${PORT}/        (Welcome message)`);
    console.log(`   - GET  http://localhost:${PORT}/about   (Student info JSON)`);
    console.log(`   - GET  http://localhost:${PORT}/time    (Current date & time)`);
    console.log(`   - ANY  http://localhost:${PORT}/<other> (404 Not Found error)`);
    console.log(`====================================================`);
  });
}

// Export the Express app instance directly for Vercel Serverless Function & testing
module.exports = app;

