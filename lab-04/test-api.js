/**
 * Automated Integration Test Suite for Lab 4
 * Verifies Registration, Login, bcrypt password hashing, and JWT tokens.
 */

const http = require('http');
const app = require('./server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'AURORA_LAB04_SECRET_KEY_2026';
const PORT = 3004;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({ status: res.statusCode, body: parsed, rawBody: body, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m : ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m : ${testName} ${details ? '(' + details + ')' : ''}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   Lab 4: Automated Integration Test Execution');
  console.log('   Student: G Sainadh Reddy (252U1R6076) - Section CSE 2B');
  console.log('======================================================\n');

  // Start test server
  let server = await new Promise((resolve, reject) => {
    const s = app.listen(PORT, '127.0.0.1', () => resolve(s));
    s.on('error', reject);
  });

  try {
    // Reset database for a clean test run
    await request({ method: 'POST', path: '/reset' });

    // Test 1: GET / Metadata
    console.log('--- Test Group 1: Server Health & Metadata ---');
    const rootRes = await request({ method: 'GET', path: '/' });
    assert(rootRes.status === 200, 'GET / returns HTTP 200');
    assert(rootRes.body.student === 'G Sainadh Reddy', 'GET / contains student name');

    // Test 2: POST /register validation failure
    console.log('\n--- Test Group 2: POST /register Validation ---');
    const missingFieldRes = await request(
      { method: 'POST', path: '/register' },
      { username: 'testuser' } // missing name and password
    );
    assert(missingFieldRes.status === 400, 'Missing fields returns HTTP 400 Bad Request');

    // Test 3: POST /register success
    console.log('\n--- Test Group 3: POST /register Success ---');
    const regRes = await request(
      { method: 'POST', path: '/register' },
      { username: 'sainadh_reddy', name: 'G Sainadh Reddy', password: 'SecurePassword123!' }
    );
    assert(regRes.status === 200, 'Valid registration returns HTTP 200');
    assert(
      regRes.rawBody.includes('User created successfully') || regRes.body?.message?.includes('User created successfully'),
      'Registration response confirms success: "User created successfully"'
    );

    // Test 4: POST /register duplicate username
    console.log('\n--- Test Group 4: POST /register Duplicate Username ---');
    const dupRes = await request(
      { method: 'POST', path: '/register' },
      { username: 'sainadh_reddy', name: 'Another Name', password: 'AnotherPassword456!' }
    );
    assert(dupRes.status === 400, 'Duplicate username returns HTTP 400 Bad Request');
    assert(
      dupRes.rawBody.includes('User already exists') || dupRes.body?.message?.includes('User already exists'),
      'Duplicate username response message is "User already exists"'
    );

    // Test 5: Verify password hashing in DB
    console.log('\n--- Test Group 5: Database Password Hashing Verification ---');
    const usersRes = await request({ method: 'GET', path: '/users' });
    assert(usersRes.status === 200, 'GET /users returns HTTP 200');
    const storedUser = usersRes.body.users.find((u) => u.username === 'sainadh_reddy');
    assert(storedUser !== undefined, 'User is stored in database table');
    assert(storedUser.password !== 'SecurePassword123!', 'Plain-text password is NEVER stored in database');
    assert(storedUser.password.startsWith('$2b$') || storedUser.password.startsWith('$2a$'), 'Password is stored as a valid bcrypt cryptographic hash');

    // Test 6: POST /login unknown user
    console.log('\n--- Test Group 6: POST /login Failure Cases ---');
    const unknownUserRes = await request(
      { method: 'POST', path: '/login' },
      { username: 'non_existent_user', password: 'AnyPassword123' }
    );
    assert(unknownUserRes.status === 400, 'Unknown username returns HTTP 400');
    assert(
      unknownUserRes.rawBody.includes('Invalid user') || unknownUserRes.body?.message?.includes('Invalid user'),
      'Unknown username response message is "Invalid user"'
    );

    // Test 7: POST /login wrong password
    const wrongPassRes = await request(
      { method: 'POST', path: '/login' },
      { username: 'sainadh_reddy', password: 'WrongPassword999' }
    );
    assert(wrongPassRes.status === 400, 'Incorrect password returns HTTP 400');
    assert(
      wrongPassRes.rawBody.includes('Invalid password') || wrongPassRes.body?.message?.includes('Invalid password'),
      'Incorrect password response message is "Invalid password"'
    );

    // Test 8: POST /login success
    console.log('\n--- Test Group 7: POST /login Success & JWT Generation ---');
    const loginRes = await request(
      { method: 'POST', path: '/login' },
      { username: 'sainadh_reddy', password: 'SecurePassword123!' }
    );
    assert(loginRes.status === 200, 'Successful login returns HTTP 200');
    assert(typeof loginRes.body.jwt_token === 'string', 'Login returns { jwt_token } string');

    const receivedToken = loginRes.body.jwt_token;

    // Test 9: JWT Structure & Payload inspection
    console.log('\n--- Test Group 8: JWT Structure & Payload Inspection ---');
    const tokenParts = receivedToken.split('.');
    assert(tokenParts.length === 3, 'JWT has three base64url segments separated by dots (Header.Payload.Signature)');

    const decodedHeader = JSON.parse(Buffer.from(tokenParts[0], 'base64url').toString('utf8'));
    assert(decodedHeader.alg === 'HS256', 'Header algorithm is HS256');
    assert(decodedHeader.typ === 'JWT', 'Header type is JWT');

    const decodedPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString('utf8'));
    assert(decodedPayload.username === 'sainadh_reddy', 'Payload contains the username');
    assert(decodedPayload.password === undefined, 'Payload NEVER contains the password');

    // Verify cryptographic signature
    const verified = jwt.verify(receivedToken, JWT_SECRET);
    assert(verified.username === 'sainadh_reddy', 'JWT signature verifies successfully with constant secret key');

    // Test 10: Protected Route Consumption
    console.log('\n--- Test Group 9: Protected Route Authorization Demo ---');
    const unauthProfileRes = await request({ method: 'GET', path: '/profile' });
    assert(unauthProfileRes.status === 401, 'Requesting protected route without token returns HTTP 401');

    const authProfileRes = await request({
      method: 'GET',
      path: '/profile',
      headers: { Authorization: `Bearer ${receivedToken}` }
    });
    assert(authProfileRes.status === 200, 'Requesting protected route with valid Bearer token returns HTTP 200');
    assert(authProfileRes.body.user.username === 'sainadh_reddy', 'Protected route returns authorized user profile');

    console.log('\n======================================================');
    console.log(`   TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('======================================================\n');

    if (failedTests > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution encountered unexpected error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
