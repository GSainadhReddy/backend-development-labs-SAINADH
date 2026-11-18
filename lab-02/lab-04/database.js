const path = require('path');
const fs = require('fs');

let sqlite3 = null;
let sqlite = null;

try {
  sqlite3 = require('sqlite3');
  sqlite = require('sqlite');
} catch (err) {
  console.warn('[DB] Native sqlite3/sqlite module not loaded directly:', err.message);
}

let dbInstance = null;

/**
 * In-memory fallback adapter for serverless deployments (e.g., Vercel)
 * or environments where native binary compilation is constrained.
 */
function createInMemoryAdapter() {
  console.log('[DB] Initializing in-memory fallback database engine...');
  let users = [];
  let nextId = 1;

  return {
    async get(query, params = []) {
      const q = query.trim().toUpperCase();
      if (q.includes('FROM USER WHERE USERNAME = ?')) {
        const username = params[0];
        const found = users.find((u) => u.username === username);
        return found ? { ...found } : undefined;
      }
      if (q.includes('FROM USER WHERE ID = ?')) {
        const id = params[0];
        const found = users.find((u) => u.id === id);
        return found ? { ...found } : undefined;
      }
      return undefined;
    },

    async all(query, params = []) {
      const q = query.trim().toUpperCase();
      if (q.includes('FROM USER')) {
        // Return users without plain text password
        return users.map((u) => ({
          id: u.id,
          username: u.username,
          name: u.name,
          password: u.password // stored hash
        }));
      }
      return [];
    },

    async run(query, params = []) {
      const q = query.trim().toUpperCase();
      if (q.includes('INSERT INTO USER')) {
        const [username, name, password] = params;
        const existing = users.find((u) => u.username === username);
        if (existing) {
          const err = new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username');
          err.code = 'SQLITE_CONSTRAINT';
          throw err;
        }
        const newUser = { id: nextId++, username, name, password };
        users.push(newUser);
        return { lastID: newUser.id, changes: 1 };
      }
      if (q.includes('DELETE FROM USER WHERE USERNAME = ?')) {
        const username = params[0];
        const initLen = users.length;
        users = users.filter((u) => u.username !== username);
        return { changes: initLen - users.length };
      }
      if (q.includes('DELETE FROM USER')) {
        const count = users.length;
        users = [];
        return { changes: count };
      }
      return { lastID: 0, changes: 0 };
    },

    async exec(query) {
      return;
    },

    async close() {
      return;
    }
  };
}

/**
 * Returns the SQLite database instance with file persistence,
 * falling back gracefully to in-memory adapter if native drivers are unavailable.
 */
async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }

  if (!sqlite || !sqlite3) {
    dbInstance = createInMemoryAdapter();
    return dbInstance;
  }

  try {
    let dbPath = path.join(__dirname, 'userData.db');

    // In Vercel serverless environments, copy to /tmp for write permission
    if (process.env.VERCEL) {
      const tmpDbPath = path.join('/tmp', 'userData.db');
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
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    return dbInstance;
  } catch (err) {
    console.warn('[DB] SQLite connection failed, using in-memory engine:', err.message);
    dbInstance = createInMemoryAdapter();
    return dbInstance;
  }
}

module.exports = { getDB };
