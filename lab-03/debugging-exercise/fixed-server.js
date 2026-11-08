/**
 * ============================================================================
 * FIXED SERVER (Lab 3 Debugging Solution)
 * ============================================================================
 * All 4 bugs resolved:
 * 
 * ✔ FIX 1: Corrected relative import path to '../database'
 * ✔ FIX 2: Corrected table name to 'books'
 * ✔ FIX 3: Added 'await' before db.get()
 * ✔ FIX 4: Used process.env.PORT || 3000 and added graceful EADDRINUSE handling
 * ============================================================================
 */

const express = require('express');

// ✔ FIX 1: Correct import path pointing to database.js in root directory
const { getDB } = require('../database');

const app = express();

// ✔ FIX 4: Dynamic port via environment variable with fallback
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint to fetch all books
app.get('/books', async (req, res, next) => {
  try {
    const db = await getDB();

    // ✔ FIX 2: Fixed table name from 'book' to 'books'
    const books = await db.all('SELECT * FROM books');
    
    res.status(200).json({ status: 'success', data: books });
  } catch (err) {
    next(err);
  }
});

// Endpoint to fetch a single book
app.get('/books/:id', async (req, res, next) => {
  try {
    const db = await getDB();
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Validation error: Book ID must be an integer" });
    }

    // ✔ FIX 3: Added 'await' to resolve the database Promise
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);

    if (!book) {
      return res.status(404).json({ message: `Book with id ${id} not found` });
    }

    res.status(200).json({ status: 'success', data: book });
  } catch (err) {
    next(err);
  }
});

// Start the server with error event handling for port collisions
const server = app.listen(PORT, () => {
  console.log(`Server successfully running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use (EADDRINUSE)!`);
    console.error(`💡 Solution:`);
    console.error(`   1. Start on a different port: PORT=3001 node fixed-server.js`);
    console.error(`   2. Or find and kill the process occupying port ${PORT}:\n      On Windows: netstat -ano | findstr :${PORT}\n      taskkill /PID <PID> /F\n`);
    process.exit(1);
  } else {
    console.error('Server encountered an error:', err);
  }
});

