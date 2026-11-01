/**
 * Automated Test Runner for Lab 2 CRUD Routes
 * Tests all 5 endpoints, validates status codes, ensures persistence,
 * and verifies SQL injection protection via parameterised queries.
 */

const http = require('http');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { app, initializeDBAndServer, getDb } = require('./index');

const TEST_PORT = 3099;

// Helper function to make HTTP requests
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          raw: data
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Starting Lab 2 Comprehensive Test Suite');
  console.log('====================================================');

  process.env.NODE_ENV = 'test';
  await initializeDBAndServer();
  const db = getDb();

  const server = app.listen(TEST_PORT);
  console.log(`[TEST SERVER] Running temporarily on port ${TEST_PORT} for testing.\n`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(testName, condition, details = '') {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) console.error(`     Details: ${details}`);
    }
  }

  try {
    // Test 1: GET /
    const resRoot = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/',
      method: 'GET'
    });
    assert('1. GET / returns status 200 and lab metadata', resRoot.statusCode === 200 && resRoot.data.status === 'success');

    // Test 2: GET /books/ (Retrieve all books)
    const resAllBooks = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/books/',
      method: 'GET'
    });
    assert('2. GET /books/ returns status 200 and an array of books', 
      resAllBooks.statusCode === 200 && Array.isArray(resAllBooks.data) && resAllBooks.data.length >= 10,
      `Expected array length >= 10, got ${Array.isArray(resAllBooks.data) ? resAllBooks.data.length : 'non-array'}`
    );

    // Test 3: GET /books/:bookId/ (Retrieve single book)
    const resOneBook = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/books/1/',
      method: 'GET'
    });
    assert('3. GET /books/1/ returns status 200 with book details', 
      resOneBook.statusCode === 200 && resOneBook.data.id === 1 && resOneBook.data.title.includes('Harry Potter'),
      `Received: ${JSON.stringify(resOneBook.data)}`
    );

    // Test 4: GET /books/:bookId/ with non-existent ID -> 404
    const resMissingBook = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/books/9999/',
      method: 'GET'
    });
    assert('4. GET /books/9999/ returns status 404 (Not Found)', 
      resMissingBook.statusCode === 404 && resMissingBook.data.error === 'Book Not Found',
      `Expected status 404, got ${resMissingBook.statusCode}`
    );

    // Test 5: POST /books/ (Create a new book)
    const newBookPayload = {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      price: 799,
      pages: 616
    };
    const resAddBook = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/books/',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, newBookPayload);
    const createdBookId = resAddBook.data ? resAddBook.data.bookId : null;
    assert('5. POST /books/ returns status 201 (Created) and generated bookId', 
      resAddBook.statusCode === 201 && createdBookId !== null,
      `Received: ${JSON.stringify(resAddBook.data)}`
    );

    // Test 6: Verify newly created book exists in SQLite
    const resVerifyAdd = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/books/${createdBookId}/`,
      method: 'GET'
    });
    assert('6. GET /books/:createdId/ verifies newly inserted book persisted in DB', 
      resVerifyAdd.statusCode === 200 && resVerifyAdd.data.title === 'Designing Data-Intensive Applications'
    );

    // Test 7: POST /books/ validation failure (missing fields) -> 400 Bad Request
    const resBadPost = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/books/',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { title: 'Incomplete Book' });
    assert('7. POST /books/ with missing fields returns status 400 (Bad Request)', 
      resBadPost.statusCode === 400 && resBadPost.data.error === 'Bad Request'
    );

    // Test 8: PUT /books/:bookId/ (Update existing book)
    const updatePayload = {
      title: 'Designing Data-Intensive Applications (2nd Edition)',
      author: 'Martin Kleppmann',
      price: 899,
      pages: 650
    };
    const resUpdate = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/books/${createdBookId}/`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, updatePayload);
    assert('8. PUT /books/:bookId/ returns status 200 and success message', 
      resUpdate.statusCode === 200 && resUpdate.data.message === 'Book Details Updated Successfully',
      `Received: ${JSON.stringify(resUpdate.data)}`
    );

    // Test 9: Verify updated values in SQLite
    const resVerifyUpdate = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/books/${createdBookId}/`,
      method: 'GET'
    });
    assert('9. GET /books/:bookId/ verifies updated price and title persisted in DB', 
      resVerifyUpdate.statusCode === 200 && resVerifyUpdate.data.price === 899 && resVerifyUpdate.data.title.includes('2nd Edition')
    );

    // Test 10: PUT /books/9999/ on non-existent book -> 404
    const resUpdateMissing = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/books/9999/',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, updatePayload);
    assert('10. PUT /books/9999/ returns status 404 (Not Found)', 
      resUpdateMissing.statusCode === 404 && resUpdateMissing.data.error === 'Book Not Found'
    );

    // Test 11: DELETE /books/:bookId/ (Delete created book)
    const resDelete = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/books/${createdBookId}/`,
      method: 'DELETE'
    });
    assert('11. DELETE /books/:bookId/ returns status 200 and success confirmation', 
      resDelete.statusCode === 200 && resDelete.data.message === 'Book Deleted Successfully',
      `Received: ${JSON.stringify(resDelete.data)}`
    );

    // Test 12: Verify deleted book now returns 404
    const resVerifyDelete = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/books/${createdBookId}/`,
      method: 'GET'
    });
    assert('12. GET /books/:deletedId/ returns status 404 (verifying deletion from SQLite)', 
      resVerifyDelete.statusCode === 404
    );

    // Test 13: DELETE /books/9999/ on non-existent book -> 404
    const resDeleteMissing = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/books/9999/',
      method: 'DELETE'
    });
    assert('13. DELETE /books/9999/ returns status 404 (Not Found)', 
      resDeleteMissing.statusCode === 404 && resDeleteMissing.data.error === 'Book Not Found'
    );

    // Test 14: SQL Injection prevention test
    const resInjection = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: "/books/1%20OR%201=1/",
      method: 'GET'
    });
    assert('14. SQL Injection payload handled safely via parameterized query', 
      resInjection.statusCode === 404,
      `Received status: ${resInjection.statusCode}`
    );

    // Test 15: Unknown route handler -> 404
    const resUnknown = await makeRequest({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/authors/',
      method: 'GET'
    });
    assert('15. Unknown route returns status 404 with error description', 
      resUnknown.statusCode === 404 && resUnknown.data.error === 'Not Found'
    );

    console.log('\n====================================================');
    console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log('====================================================');

    server.close();
    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
      process.exit(0);
    } else {
      console.error('❌ Some tests failed.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite encountered an error:', err);
    server.close();
    process.exit(1);
  }
}

runTestSuite();
