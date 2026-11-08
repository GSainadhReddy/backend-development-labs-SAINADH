const express = require('express');
const { getDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON request bodies
app.use(express.json());

// Request logger for debugging & development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * Validation Middleware for Book Data (POST and PUT requests)
 * Rejects missing title, author, or a non-numeric/negative price with HTTP 400.
 */
function validateBookBody(req, res, next) {
  const { title, author, price } = req.body;

  if (title === undefined || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      message: "Validation error: 'title' is required and must be a non-empty string"
    });
  }

  if (author === undefined || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).json({
      message: "Validation error: 'author' is required and must be a non-empty string"
    });
  }

  if (
    price === undefined ||
    price === null ||
    typeof price === 'boolean' ||
    typeof price === 'object' ||
    isNaN(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      message: "Validation error: 'price' is required and must be a non-negative number"
    });
  }

  req.sanitizedBook = {
    title: title.trim(),
    author: author.trim(),
    price: parseFloat(Number(price).toFixed(2))
  };

  next();
}

/* ==========================================================================
   RESTful Endpoints for /books
   ========================================================================== */

/**
 * Task 1, 2, 3: GET /books
 * Supports query parameters:
 *  - search_q: partial title match (LIKE %search_q%)
 *  - order_by: column to sort by ('id', 'title', 'author', 'price'), default 'id'
 *  - order: 'ASC' or 'DESC', default 'ASC'
 *  - limit: number of records per page, default 10
 *  - offset: record offset for pagination, default 0
 *  - min_price: minimum price filter
 *  - max_price: maximum price filter
 */
app.get('/books', async (req, res, next) => {
  try {
    const db = await getDB();
    const {
      search_q,
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price,
      max_price
    } = req.query;

    const conditions = [];
    const params = [];

    // 1. Partial title match with LIKE
    if (search_q && search_q.trim() !== '') {
      conditions.push('title LIKE ?');
      params.push(`%${search_q.trim()}%`);
    }

    // 2. Price range filtering
    const hasMin = min_price !== undefined && min_price !== '';
    const hasMax = max_price !== undefined && max_price !== '';

    if (hasMin && isNaN(Number(min_price))) {
      return res.status(400).json({ message: "Validation error: 'min_price' must be a valid number" });
    }
    if (hasMax && isNaN(Number(max_price))) {
      return res.status(400).json({ message: "Validation error: 'max_price' must be a valid number" });
    }

    if (hasMin && hasMax) {
      const min = Number(min_price);
      const max = Number(max_price);
      if (min > max) {
        return res.status(400).json({ message: "Validation error: 'min_price' cannot be greater than 'max_price'" });
      }
      conditions.push('price BETWEEN ? AND ?');
      params.push(min, max);
    } else if (hasMin) {
      conditions.push('price >= ?');
      params.push(Number(min_price));
    } else if (hasMax) {
      conditions.push('price <= ?');
      params.push(Number(max_price));
    }

    // 3. Sorting (whitelisted to prevent SQL Injection)
    const allowedColumns = ['id', 'title', 'author', 'price'];
    const safeOrderBy = allowedColumns.includes(String(order_by).toLowerCase())
      ? String(order_by).toLowerCase()
      : 'id';

    const safeOrder = String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // 4. Pagination (limit and offset validation)
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ message: "Validation error: 'limit' must be a positive integer" });
    }
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ message: "Validation error: 'offset' must be a non-negative integer" });
    }

    // Build SQL Query
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query for total matching records
    const countQuery = `SELECT COUNT(*) as total FROM books ${whereClause}`;
    const totalRow = await db.get(countQuery, params);

    // Main records query
    const dataQuery = `
      SELECT * FROM books
      ${whereClause}
      ORDER BY ${safeOrderBy} ${safeOrder}
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, parsedLimit, parsedOffset];
    const books = await db.all(dataQuery, dataParams);

    return res.status(200).json({
      status: 'success',
      total: totalRow.total,
      count: books.length,
      limit: parsedLimit,
      offset: parsedOffset,
      order_by: safeOrderBy,
      order: safeOrder,
      data: books
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Task 1, 5: GET /books/:id
 * Returns 200 with book data if found, or 404 if ID does not exist.
 */
app.get('/books/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Validation error: Book ID must be an integer" });
    }

    const db = await getDB();
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);

    if (!book) {
      return res.status(404).json({ message: `Book with id ${id} not found` });
    }

    return res.status(200).json({
      status: 'success',
      data: book
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Task 1, 4, 5: POST /books
 * Validates body, creates book record, returns 201 with newly created book.
 */
app.post('/books', validateBookBody, async (req, res, next) => {
  try {
    const { title, author, price } = req.sanitizedBook;
    const db = await getDB();

    const result = await db.run(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
      [title, author, price]
    );

    const createdBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Book created successfully',
      data: createdBook
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Task 1, 5: PUT /books/:id
 * Updates existing book. Returns 200 on success, 404 if ID not found, 400 on validation failure.
 */
app.put('/books/:id', validateBookBody, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Validation error: Book ID must be an integer" });
    }

    const db = await getDB();
    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);

    if (!existingBook) {
      return res.status(404).json({ message: `Book with id ${id} not found` });
    }

    const { title, author, price } = req.sanitizedBook;
    await db.run(
      'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
      [title, author, price, id]
    );

    const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Task 1, 5: DELETE /books/:id
 * Deletes existing book. Returns 200 on success, 404 if ID not found.
 */
app.delete('/books/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Validation error: Book ID must be an integer" });
    }

    const db = await getDB();
    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);

    if (!existingBook) {
      return res.status(404).json({ message: `Book with id ${id} not found` });
    }

    await db.run('DELETE FROM books WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Book deleted successfully',
      deleted_book: existingBook
    });
  } catch (err) {
    next(err);
  }
});

// Fallback for undefined routes (consistent error format)
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start server if executed directly
if (require.main === module) {
  const server = app.listen(PORT, async () => {
    try {
      await getDB();
      console.log(`===============================================`);
      console.log(`  Lab 3 REST API Server running on port ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}/books`);
      console.log(`===============================================`);
    } catch (dbErr) {
      console.error('Failed to initialize database on startup:', dbErr);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use (EADDRINUSE).`);
      console.error(`Try setting a different port using: PORT=3001 node server.js`);
    } else {
      console.error('Server error:', err);
    }
  });
}

module.exports = app;

