const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * Creates the 'books' table if it does not already exist,
 * and populates initial sample data if the table is empty.
 */
async function getDB() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, 'books.db'),
      driver: sqlite3.Database,
    });

    // Enable WAL mode for better concurrency and foreign keys
    await dbInstance.exec('PRAGMA foreign_keys = ON;');

    // Create the 'books' table
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL
      );
    `);

    // Seed sample books if empty
    const countResult = await dbInstance.get('SELECT COUNT(*) as count FROM books');
    if (countResult.count === 0) {
      console.log('Seeding initial sample books...');
      const sampleBooks = [
        ['Clean Code', 'Robert C. Martin', 34.99],
        ['The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 42.50],
        ['Design Patterns', 'Erich Gamma et al.', 54.00],
        ['JavaScript: The Good Parts', 'Douglas Crockford', 29.99],
        ["You Don't Know JS", 'Kyle Simpson', 24.50],
        ['Introduction to Algorithms', 'Thomas H. Cormen', 89.99],
        ['Refactoring', 'Martin Fowler', 47.95],
        ['Head First Design Patterns', 'Eric Freeman', 38.00],
      ];

      for (const [title, author, price] of sampleBooks) {
        await dbInstance.run(
          'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
          [title, author, price]
        );
      }
      console.log(`Seeded ${sampleBooks.length} sample books.`);
    }
  }

  return dbInstance;
}

module.exports = { getDB };

