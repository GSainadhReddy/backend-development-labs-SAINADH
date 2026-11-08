/**
 * ============================================================================
 * BROKEN SERVER (Faculty Handout for Lab 3 Debugging Exercise)
 * ============================================================================
 * This file contains 4 classic backend bugs commonly encountered in Node/Express:
 * 
 * BUG 1: Wrong import path
 * BUG 2: Table-name typo ('book' instead of 'books')
 * BUG 3: Missing await on asynchronous database query
 * BUG 4: Port conflict (EADDRINUSE)
 * 
 * Follow the accompanying DEBUGGING_GUIDE.md to diagnose and resolve each bug.
 * ============================================================================
 */

const express = require('express');

// ❌ BUG 1: WRONG IMPORT PATH
// Throws: Cannot find module './db/database'
const { getDB } = require('./db/database'); 

const app = express();

// ❌ BUG 4: HARDCODED PORT CONFLICT (EADDRINUSE)
// If another instance or server is running on port 3000, this crashes without fallback.
const PORT = 3000;

app.use(express.json());

// Endpoint to fetch all books
app.get('/books', async (req, res, next) => {
  try {
    const db = await getDB();

    // ❌ BUG 2: TABLE-NAME TYPO
    // Queries 'book' instead of 'books' -> SQLite throws: SQLITE_ERROR: no such table: book
    const books = await db.all('SELECT * FROM book');
    
    res.status(200).json({ status: 'success', data: books });
  } catch (err) {
    next(err);
  }
});

// Endpoint to fetch a single book
app.get('/books/:id', async (req, res, next) => {
  try {
    const db = await getDB();
    const id = req.params.id;

    // ❌ BUG 3: MISSING AWAIT
    // db.get() returns a Promise. Without 'await', book is Promise { <pending> },
    // so res.json sends an empty object {} and if condition checking (if (!book)) fails!
    const book = db.get('SELECT * FROM books WHERE id = ?', [id]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Express serializes Promise to {} in JSON
    res.status(200).json({ status: 'success', data: book });
  } catch (err) {
    next(err);
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Broken server attempting to listen on port ${PORT}`);
});

// Unhandled error listener - will crash abruptly on EADDRINUSE

