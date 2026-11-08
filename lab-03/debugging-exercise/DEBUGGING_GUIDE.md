# Lab 3: Debugging Exercise Guide

This guide walks through the 4 classic backend errors handed out in the debugging exercise, explaining the root cause, terminal/API symptoms, and step-by-step resolution.

---

## Bug 1: Wrong Import Path (`MODULE_NOT_FOUND`)

### 1. Symptom & Error Trace
When starting the server with `node debugging-exercise/broken-server.js`:
```text
node:internal/modules/cjs/loader:1252
  throw err;
  ^

Error: Cannot find module './db/database'
Require stack:
- C:\...\lab-03\debugging-exercise\broken-server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1249:15)
    at Module._load (node:internal/modules/cjs/loader:1075:27)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Module.require (node:internal/modules/cjs/loader:1342:12)
    at require (node:internal/modules/helpers:138:16)
    at Object.<anonymous> (C:\...\lab-03\debugging-exercise\broken-server.js:19:19) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ 'C:\\...\\lab-03\\debugging-exercise\\broken-server.js' ]
}
```

### 2. Root Cause
In `broken-server.js`, line 19 imports:
```javascript
const { getDB } = require('./db/database');
```
The file `database.js` is located in the parent directory (`../database`), not in a subfolder named `./db/`.

### 3. Solution
Update the relative require path:
```javascript
// Fixed:
const { getDB } = require('../database');
```

---

## Bug 2: Port Conflict (`EADDRINUSE`)

### 1. Symptom & Error Trace
When running two server instances on the same port (e.g. port 3000):
```text
events.js:377
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (net.js:1331:16)
    at listenInCluster (net.js:1379:12)
    at Server.listen (net.js:1467:7)
    at Function.listen (C:\...\node_modules\express\lib\application.js:635:24)
Emitted 'error' event on Server instance at:
    at emitErrorNT (net.js:1358:8)
    at processTicksAndRejections (internal/process/task_queues.js:82:21) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3000
}
```

### 2. Root Cause
`EADDRINUSE` stands for **Error: Address Already In Use**. A TCP port can only be bound by a single listening process at a time. This happens when:
1. An existing server instance is already running in background.
2. The port number is hardcoded (e.g. `const PORT = 3000;`) without support for dynamic assignment.

### 3. Solution
1. **Dynamic Port with Environment Variable Fallback:**
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```
2. **Handle the error event gracefully:**
   ```javascript
   server.on('error', (err) => {
     if (err.code === 'EADDRINUSE') {
       console.error(`Port ${PORT} is busy. Run with: PORT=3001 node server.js`);
     }
   });
   ```
3. **To free the busy port:**
   - **Windows:**
     ```powershell
     netstat -ano | findstr :3000
     taskkill /PID <PID> /F
     ```
   - **Linux / macOS:**
     ```bash
     lsof -i :3000
     kill -9 <PID>
     ```

---

## Bug 3: Table-Name Typo (`no such table`)

### 1. Symptom & Error Trace
When sending a `GET http://localhost:3000/books`:
The terminal logs:
```text
Unhandled Application Error: [Error: SQLITE_ERROR: no such table: book] {
  errno: 1,
  code: 'SQLITE_ERROR'
}
```
And the client receives an HTTP 500 Internal Server Error.

### 2. Root Cause
The database table was initialized as `books` (plural), but the SQL query in `broken-server.js` was:
```javascript
const books = await db.all('SELECT * FROM book');
```
Because SQLite is schema-enforced, referencing non-existent table `book` causes SQLite to throw `SQLITE_ERROR: no such table: book`.

### 3. Solution
Correct the SQL query to reference the table name `books`:
```javascript
// Fixed:
const books = await db.all('SELECT * FROM books');
```

---

## Bug 4: Missing `await` on Asynchronous Operations

### 1. Symptom & Unexpected Behavior
When sending a `GET http://localhost:3000/books/1`:
- The client receives an empty JSON object `{}` instead of the book object:
  ```json
  {
    "status": "success",
    "data": {}
  }
  ```
- Or `if (!book)` check evaluates to false because a `Promise` object is truthy, so the 404 branch is never reached even for IDs that do not exist!

### 2. Root Cause
In Node.js asynchronous drivers (like `sqlite`), `db.get()`, `db.all()`, and `db.run()` return a `Promise`.
In `broken-server.js`:
```javascript
// ❌ Missing await:
const book = db.get('SELECT * FROM books WHERE id = ?', [id]);
```
- `book` holds a `Promise { <pending> }`.
- In JavaScript, `Boolean(Promise)` is **always `true`**, so `if (!book)` fails to detect non-existent records.
- When `res.json(book)` is called, `JSON.stringify` converts unresolved promises into an empty object `{}`.

### 3. Solution
Prefix asynchronous calls with `await`:
```javascript
// Fixed:
const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
```
Ensure the enclosing route handler is marked `async (req, res, next) => { ... }`.

