/**
 * Lab 4: Registration, login and JWT
 * Backend Development Fundamentals · Year II Term II · Aurora
 * Faculty: Joel Prashanth D
 * Student: G Sainadh Reddy · Registration Number: 252U1R6076 · Section: CSE 2B
 *
 * Objectives & Tasks:
 * 1. Install bcrypt and jsonwebtoken; add app.use(express.json()) so the body can be read.
 * 2. Create a user table with a unique username, name, and a password column that stores the hash.
 * 3. POST /register/: reject an existing username with 400; otherwise hash the password with bcrypt.hash and save the user.
 * 4. POST /login/: return 400 for an unknown user, compare the password with bcrypt.compare, return 400 for a wrong password, and on success return { jwt_token } created with jwt.sign.
 * 5. Put only the username (never the password) in the token payload and keep the secret key in a constant for now (moved to .env in Lab 8).
 * 6. Decode the token at jwt.io and identify the header, payload and signature.
 * 7. Test registration and login for valid and invalid inputs in Postman.
 */

const express = require('express');
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  bcrypt = require('bcryptjs');
}
const jwt = require('jsonwebtoken');
const { getDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Task 5: Secret key in a constant for now (moved to .env in Lab 8)
const JWT_SECRET = 'AURORA_LAB04_SECRET_KEY_2026';

// Task 1: Middleware so the JSON request body can be parsed
app.use(express.json());

// Request logging middleware for debugging & audit trail
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ==========================================================================
   Helper: Format Response
   Supports both plain text responses (standard CCBP/Aurora convention)
   and structured JSON if specifically requested via format query or header.
   ========================================================================== */
function sendResult(req, res, statusCode, message, data = null) {
  res.status(statusCode);
  if (data) {
    return res.json(data);
  }
  const wantsJson = req.query.format === 'json' || 
    (req.headers['accept'] && req.headers['accept'].includes('application/json') && !req.headers['accept'].includes('*/*'));
  if (wantsJson) {
    return res.json({ message, status: statusCode });
  }
  return res.send(message);
}

/* ==========================================================================
   Routes
   ========================================================================== */

/**
 * Root metadata endpoint: overview, author information, and API route guide
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    lab: 'Lab 4: Registration, login and JWT',
    student: 'G Sainadh Reddy',
    registrationNumber: '252U1R6076',
    section: 'CSE 2B',
    faculty: 'Joel Prashanth D',
    institution: 'Aurora',
    endpoints: [
      { method: 'POST', path: '/register', description: 'Register a new user with hashed password (bcrypt)' },
      { method: 'POST', path: '/login', description: 'Authenticate user and return JWT token { jwt_token }' },
      { method: 'GET', path: '/users', description: 'Inspect users database (verifies password hashes are stored, not plain text)' },
      { method: 'GET', path: '/profile', description: 'Protected route demo: verify JWT token from Authorization header' }
    ]
  });
});

/**
 * Task 3: POST /register/
 * - Reject missing required fields with 400.
 * - Reject existing username with 400 ("User already exists").
 * - Hash password with bcrypt.hash(password, 10).
 * - Save user with parameterised SQL query.
 * - Return 200 ("User created successfully").
 */
app.post(['/register', '/register/'], async (req, res) => {
  try {
    const { username, name, password } = req.body;

    // Validate request body
    if (!username || !name || !password) {
      return sendResult(req, res, 400, 'Missing required fields: username, name, and password are required');
    }

    if (typeof username !== 'string' || typeof name !== 'string' || typeof password !== 'string') {
      return sendResult(req, res, 400, 'Invalid data types: username, name, and password must be strings');
    }

    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    if (!trimmedUsername || !trimmedName || !password) {
      return sendResult(req, res, 400, 'Username, name, and password cannot be empty strings');
    }

    const db = await getDB();

    // Parameterised query to check if username already exists
    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [trimmedUsername]);

    if (dbUser !== undefined) {
      return sendResult(req, res, 400, 'User already exists');
    }

    // Hash password with bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database using parameterised query
    const createUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?);
    `;
    await db.run(createUserQuery, [trimmedUsername, trimmedName, hashedPassword]);

    return sendResult(req, res, 200, 'User created successfully');
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * Task 4: POST /login/
 * - Validate request body.
 * - Return 400 for unknown user ("Invalid user").
 * - Compare password with bcrypt.compare.
 * - Return 400 for wrong password ("Invalid password").
 * - On success return { jwt_token } created with jwt.sign.
 * Task 5:
 * - Put only username in payload (never password).
 * - Keep secret key in a constant.
 */
app.post(['/login', '/login/'], async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
      return sendResult(req, res, 400, 'Missing username or password');
    }

    const trimmedUsername = typeof username === 'string' ? username.trim() : '';

    const db = await getDB();

    // Parameterised query to find user by username
    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [trimmedUsername]);

    // Check if user exists
    if (dbUser === undefined) {
      return sendResult(req, res, 400, 'Invalid user');
    }

    // Compare plain text password against stored bcrypt hash
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordMatched) {
      return sendResult(req, res, 400, 'Invalid password');
    }

    // Task 5: Only username in payload (NEVER password!)
    const payload = {
      username: dbUser.username,
    };

    // Generate JWT token with constant secret key
    const jwt_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    // On success return { jwt_token }
    return res.status(200).json({ jwt_token });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * Helper endpoint: GET /users
 * Allows faculty/students to view the user table and inspect that only
 * bcrypt hashes are stored in the database, never plain text passwords!
 */
app.get(['/users', '/users/'], async (req, res) => {
  try {
    const db = await getDB();
    const selectAllUsersQuery = `SELECT id, username, name, password FROM user;`;
    const users = await db.all(selectAllUsersQuery);

    res.status(200).json({
      count: users.length,
      note: 'Notice: The password column contains only bcrypt cryptographic hashes ($2b$10$...), never plain text.',
      users: users
    });
  } catch (error) {
    console.error('[GET USERS ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * Demonstration endpoint: GET /profile
 * Validates JWT token from the Authorization header (Bearer <jwt_token>)
 * to illustrate how the generated token is consumed by protected routes.
 */
app.get(['/profile', '/profile/'], async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    let jwtToken;
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(' ')[1];
    }

    if (jwtToken === undefined) {
      return res.status(401).send('Invalid JWT Token');
    }

    jwt.verify(jwtToken, JWT_SECRET, async (error, payload) => {
      if (error) {
        return res.status(401).send('Invalid JWT Token');
      }

      const db = await getDB();
      const selectUserQuery = `SELECT id, username, name FROM user WHERE username = ?;`;
      const dbUser = await db.get(selectUserQuery, [payload.username]);

      res.status(200).json({
        message: 'Token verified successfully',
        tokenPayload: payload,
        user: dbUser
      });
    });
  } catch (error) {
    console.error('[PROFILE ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * Test utility endpoint: POST /reset
 * Clears user records for repeatable test suites.
 */
app.post(['/reset', '/reset/'], async (req, res) => {
  try {
    const db = await getDB();
    await db.run('DELETE FROM user;');
    res.status(200).json({ message: 'User table reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 404 Catch-All Handler
 */
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start listening if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Lab 4 Server running on http://localhost:${PORT}`);
    console.log(`  POST /register  - Register new user`);
    console.log(`  POST /login     - Authenticate & get JWT token`);
    console.log(`  GET  /users     - Inspect database hashes`);
    console.log(`===============================================`);
  });
}

module.exports = app;
