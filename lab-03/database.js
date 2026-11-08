const path = require('path');
const fs = require('fs');

let sqlite3 = null;
let sqlite = null;

try {
  sqlite3 = require('sqlite3');
  sqlite = require('sqlite');
} catch (err) {
  console.warn('[DB] Native sqlite3 could not be loaded directly:', err.message);
}

let dbInstance = null;

// Initial 8 sample books for Lab 3
const INITIAL_BOOKS = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', price: 34.99 },
  { id: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', price: 42.50 },
  { id: 3, title: 'Design Patterns', author: 'Erich Gamma et al.', price: 54.00 },
  { id: 4, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 29.99 },
  { id: 5, title: "You Don't Know JS", author: 'Kyle Simpson', price: 24.50 },
  { id: 6, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 89.99 },
  { id: 7, title: 'Refactoring', author: 'Martin Fowler', price: 47.95 },
  { id: 8, title: 'Head First Design Patterns', author: 'Eric Freeman', price: 38.00 },
];

/**
 * In-memory fallback adapter for serverless environments (e.g. Vercel)
 * where native C++ binaries or disk writes are restricted.
 */
function createInMemoryAdapter() {
  console.log('[DB] Initializing SQLite In-Memory Compatibility Engine for Serverless deployment');
  let books = JSON.parse(JSON.stringify(INITIAL_BOOKS));
  let autoIncrementId = 8;

  return {
    async all(query, params = []) {
      const q = query.trim().toUpperCase();

      if (q.includes('COUNT(*)')) {
        let filtered = [...books];
        if (params.length > 0) {
          // If search or price filters present
          filtered = filterBooks(books, query, params);
        }
        return [{ total: filtered.length, count: filtered.length }];
      }

      let result = filterBooks(books, query, params);

      // Sorting
      if (query.includes('ORDER BY')) {
        const desc = query.toUpperCase().includes('DESC');
        if (query.toLowerCase().includes('order by price')) {
          result.sort((a, b) => (desc ? b.price - a.price : a.price - b.price));
        } else if (query.toLowerCase().includes('order by title')) {
          result.sort((a, b) => (desc ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)));
        } else if (query.toLowerCase().includes('order by author')) {
          result.sort((a, b) => (desc ? b.author.localeCompare(a.author) : a.author.localeCompare(b.author)));
        } else {
          result.sort((a, b) => (desc ? b.id - a.id : a.id - b.id));
        }
      }

      // Pagination LIMIT & OFFSET (at the end of params)
      if (query.toUpperCase().includes('LIMIT ? OFFSET ?')) {
        const offset = parseInt(params[params.length - 1], 10) || 0;
        const limit = parseInt(params[params.length - 2], 10) || 10;
        result = result.slice(offset, offset + limit);
      }

      return result;
    },

    async get(query, params = []) {
      const q = query.trim().toUpperCase();

      if (q.includes('COUNT(*)')) {
        let filtered = [...books];
        if (params.length > 0) {
          filtered = filterBooks(books, query, params);
        }
        return { total: filtered.length, count: filtered.length };
      }

      if (q.includes('WHERE ID = ?')) {
        const id = parseInt(params[0], 10);
        return books.find((b) => b.id === id) || null;
      }

      return books[0] || null;
    },

    async run(query, params = []) {
      const q = query.trim().toUpperCase();

      if (q.startsWith('INSERT INTO')) {
        autoIncrementId += 1;
        const [title, author, price] = params;
        const newBook = {
          id: autoIncrementId,
          title: String(title),
          author: String(author),
          price: parseFloat(Number(price).toFixed(2)),
        };
        books.push(newBook);
        return { lastID: autoIncrementId, changes: 1 };
      }

      if (q.startsWith('UPDATE')) {
        const [title, author, price, idParam] = params;
        const id = parseInt(idParam, 10);
        const idx = books.findIndex((b) => b.id === id);
        if (idx !== -1) {
          books[idx] = {
            id,
            title: String(title),
            author: String(author),
            price: parseFloat(Number(price).toFixed(2)),
          };
          return { lastID: id, changes: 1 };
        }
        return { lastID: id, changes: 0 };
      }

      if (q.startsWith('DELETE FROM')) {
        const id = parseInt(params[0], 10);
        const prevCount = books.length;
        books = books.filter((b) => b.id !== id);
        return { lastID: id, changes: prevCount - books.length };
      }

      return { lastID: 0, changes: 0 };
    },

    async exec() {
      return true;
    },
  };
}

function filterBooks(source, query, params) {
  let result = [...source];
  const qUpper = query.toUpperCase();

  // Search query (title LIKE ?)
  if (qUpper.includes('TITLE LIKE ?')) {
    const searchParam = params.find((p) => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
    if (searchParam) {
      const keyword = searchParam.slice(1, -1).toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(keyword));
    }
  }

  // Price range BETWEEN ? AND ?
  if (qUpper.includes('PRICE BETWEEN ? AND ?')) {
    const min = Number(params[params.length - (qUpper.includes('LIMIT') ? 4 : 2)]);
    const max = Number(params[params.length - (qUpper.includes('LIMIT') ? 3 : 1)]);
    result = result.filter((b) => b.price >= min && b.price <= max);
  } else if (qUpper.includes('PRICE >= ?')) {
    const minParam = params.find((p) => typeof p === 'number');
    if (minParam !== undefined) result = result.filter((b) => b.price >= minParam);
  } else if (qUpper.includes('PRICE <= ?')) {
    const maxParam = params.find((p) => typeof p === 'number');
    if (maxParam !== undefined) result = result.filter((b) => b.price <= maxParam);
  }

  return result;
}

/**
 * Returns the database instance: native SQLite with file persistence,
 * with fallback to serverless in-memory adapter if needed.
 */
async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }

  // If native sqlite3 / sqlite is unavailable, use the fallback adapter
  if (!sqlite || !sqlite3) {
    dbInstance = createInMemoryAdapter();
    return dbInstance;
  }

  try {
    let dbPath = path.join(__dirname, 'books.db');

    // On Vercel serverless, copy file to /tmp for read/write access
    if (process.env.VERCEL) {
      const tmpDbPath = path.join('/tmp', 'books.db');
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(dbPath)) {
          try {
            fs.copyFileSync(dbPath, tmpDbPath);
          } catch (e) {
            console.warn('[DB] Could not copy DB to /tmp, will initialize fresh:', e.message);
          }
        }
      }
      dbPath = tmpDbPath;
    }

    dbInstance = await sqlite.open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await dbInstance.exec('PRAGMA foreign_keys = ON;');
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL
      );
    `);

    const countResult = await dbInstance.get('SELECT COUNT(*) as count FROM books');
    if (countResult.count === 0) {
      for (const [title, author, price] of INITIAL_BOOKS.map((b) => [b.title, b.author, b.price])) {
        await dbInstance.run('INSERT INTO books (title, author, price) VALUES (?, ?, ?)', [title, author, price]);
      }
    }

    return dbInstance;
  } catch (err) {
    console.warn('[DB] Native SQLite initialization failed, falling back to in-memory store:', err.message);
    dbInstance = createInMemoryAdapter();
    return dbInstance;
  }
}

module.exports = { getDB };
