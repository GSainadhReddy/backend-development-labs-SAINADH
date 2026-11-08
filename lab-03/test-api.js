const http = require('http');
const app = require('./server');
const { getDB } = require('./database');

const PORT = 3999; // Use unique port for tests to avoid collisions

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  await getDB();
  const server = app.listen(PORT, async () => {
    console.log(`🧪 Test server started on port ${PORT}\n`);

    try {
      // 1. GET /books - Default params
      console.log('--- Test Suite 1: GET /books defaults & pagination ---');
      const res1 = await request('GET', '/books');
      assert(res1.status === 200, 'GET /books returns 200 OK');
      assert(res1.body.status === 'success', 'Response contains status: "success"');
      assert(Array.isArray(res1.body.data), 'Response data is an array');
      assert(res1.body.limit === 10, 'Default limit is 10');
      assert(res1.body.offset === 0, 'Default offset is 0');
      assert(res1.body.order_by === 'id', 'Default order_by is id');
      assert(res1.body.order === 'ASC', 'Default order is ASC');

      // 2. GET /books - Search query (partial title match with LIKE)
      console.log('\n--- Test Suite 2: Search filter (search_q) ---');
      const res2 = await request('GET', '/books?search_q=Clean');
      assert(res2.status === 200, 'GET /books?search_q=Clean returns 200');
      assert(res2.body.data.every(b => b.title.toLowerCase().includes('clean')), 'All results match search "Clean"');

      // 3. GET /books - Sorting (order_by=price&order=DESC)
      console.log('\n--- Test Suite 3: Sorting (order_by & order) ---');
      const res3 = await request('GET', '/books?order_by=price&order=DESC');
      assert(res3.status === 200, 'GET /books?order_by=price&order=DESC returns 200');
      const prices = res3.body.data.map(b => b.price);
      const isSortedDesc = prices.every((val, i, arr) => !i || arr[i - 1] >= val);
      assert(isSortedDesc, 'Books are sorted descending by price');

      // 4. GET /books - Price range filter (min_price and max_price)
      console.log('\n--- Test Suite 4: Price range filtering ---');
      const res4 = await request('GET', '/books?min_price=30&max_price=50');
      assert(res4.status === 200, 'GET /books with min_price and max_price returns 200');
      assert(res4.body.data.every(b => b.price >= 30 && b.price <= 50), 'All books are between 30 and 50');

      // Invalid price range (min > max) -> 400
      const res4_err = await request('GET', '/books?min_price=100&max_price=50');
      assert(res4_err.status === 400, 'min_price > max_price returns 400 Bad Request');
      assert(res4_err.body.message.includes('cannot be greater than'), 'Clear error message returned');

      // 5. POST /books - Validation failures
      console.log('\n--- Test Suite 5: POST body validation ---');
      // Missing title
      const res5_noTitle = await request('POST', '/books', { author: 'Test Author', price: 19.99 });
      assert(res5_noTitle.status === 400, 'Missing title returns 400');
      assert(res5_noTitle.body.message.includes("'title' is required"), 'Error message mentions title');

      // Missing author
      const res5_noAuthor = await request('POST', '/books', { title: 'Test Book', price: 19.99 });
      assert(res5_noAuthor.status === 400, 'Missing author returns 400');
      assert(res5_noAuthor.body.message.includes("'author' is required"), 'Error message mentions author');

      // Non-numeric price
      const res5_badPrice = await request('POST', '/books', { title: 'Test Book', author: 'Test Author', price: 'free' });
      assert(res5_badPrice.status === 400, 'Non-numeric price returns 400');
      assert(res5_badPrice.body.message.includes("'price' is required and must be a non-negative number"), 'Error message mentions price');

      // 6. POST /books - Successful creation -> 201
      console.log('\n--- Test Suite 6: POST /books success (201) ---');
      const newBookPayload = {
        title: 'Building Microservices',
        author: 'Sam Newman',
        price: 44.99
      };
      const res6 = await request('POST', '/books', newBookPayload);
      assert(res6.status === 201, 'POST /books returns 201 Created');
      assert(res6.body.data.title === newBookPayload.title, 'Created book title matches');
      assert(res6.body.data.id !== undefined, 'Created book has generated ID');
      const createdId = res6.body.data.id;

      // 7. GET /books/:id - Found (200) vs Not Found (404)
      console.log('\n--- Test Suite 7: GET /books/:id (200 & 404) ---');
      const res7_found = await request('GET', `/books/${createdId}`);
      assert(res7_found.status === 200, 'GET /books/:id returns 200 for existing book');
      assert(res7_found.body.data.id === createdId, 'Fetched book id matches requested id');

      const res7_notFound = await request('GET', '/books/999999');
      assert(res7_notFound.status === 404, 'GET /books/999999 returns 404 Not Found');
      assert(res7_notFound.body.message.includes('not found'), 'Returns consistent error format { message: "..." }');

      // 8. PUT /books/:id - Update (200 & 404)
      console.log('\n--- Test Suite 8: PUT /books/:id (200 & 404) ---');
      const updatePayload = {
        title: 'Building Microservices (2nd Edition)',
        author: 'Sam Newman',
        price: 49.99
      };
      const res8_update = await request('PUT', `/books/${createdId}`, updatePayload);
      assert(res8_update.status === 200, 'PUT /books/:id returns 200 OK after update');
      assert(res8_update.body.data.title === updatePayload.title, 'Updated book title matches');
      assert(res8_update.body.data.price === updatePayload.price, 'Updated book price matches');

      const res8_updateNotFound = await request('PUT', '/books/999999', updatePayload);
      assert(res8_updateNotFound.status === 404, 'PUT /books/999999 returns 404 Not Found');

      // 9. DELETE /books/:id - Delete (200 & 404)
      console.log('\n--- Test Suite 9: DELETE /books/:id (200 & 404) ---');
      const res9_delete = await request('DELETE', `/books/${createdId}`);
      assert(res9_delete.status === 200, 'DELETE /books/:id returns 200 OK after delete');
      assert(res9_delete.body.message === 'Book deleted successfully', 'Returns success message');

      const res9_deleteAgain = await request('DELETE', `/books/${createdId}`);
      assert(res9_deleteAgain.status === 404, 'Deleting non-existent book returns 404 Not Found');

      console.log('\n===============================================');
      console.log('🎉 ALL LAB 3 TEST SUITES PASSED SUCCESSFULLY!');
      console.log('===============================================');
      server.close();
      process.exit(0);
    } catch (testErr) {
      console.error('Test execution failed with error:', testErr);
      server.close();
      process.exit(1);
    }
  });
}

runTests();

