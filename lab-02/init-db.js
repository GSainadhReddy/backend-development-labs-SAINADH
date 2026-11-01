/**
 * Database Initialization Script for Lab 2
 * Reads setup.sql or runs schema & seed queries using sqlite3 to generate goodreads.db
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const dbPath = path.join(__dirname, 'goodreads.db');
const sqlPath = path.join(__dirname, 'setup.sql');

async function initializeDatabase() {
  console.log(`[DB INIT] Connecting to SQLite database at: ${dbPath}`);
  
  // Open SQLite database connection
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  try {
    const setupSql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute multiple SQL statements
    await db.exec(setupSql);

    console.log('[DB INIT] Successfully initialized table `book` and seeded 10 records.');
    
    // Verify records
    const books = await db.all('SELECT * FROM book ORDER BY id ASC;');
    console.log(`[DB INIT] Verification: Loaded ${books.length} books:`);
    console.table(books);
    
    return books;
  } catch (error) {
    console.error('[DB INIT] Error initializing database:', error);
    process.exit(1);
  } finally {
    await db.close();
    console.log('[DB INIT] Database connection closed.');
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, dbPath };
