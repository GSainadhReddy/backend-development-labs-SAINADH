/**
 * Lab 1: Plain Node.js HTTP Server
 * Course: Backend Development Fundamentals · Year II Term II · Aurora
 * Faculty: Joel Prashanth D
 * 
 * Objective (Task 3):
 * Plain server with http.createServer that replies "Hello" and listens on port 3000.
 */

const http = require('http');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

// Create HTTP server
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  
  // Set headers
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Server-Type': 'Node.js built-in http module'
  });

  // Log incoming request and status code
  console.log(`[HTTP Server] [${timestamp}] ${req.method} ${req.url} -> Status: 200 OK`);

  // Respond with "Hello"
  res.end('Hello');
});

// Start listening
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[Task 3] Plain Node.js HTTP Server is running!`);
  console.log(`URL: http://${HOST}:${PORT}`);
  console.log(`Response: "Hello"`);
  console.log(`Press Ctrl+C to terminate the server.`);
  console.log(`====================================================`);
});
