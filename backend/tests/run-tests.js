const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const Cart = require('../src/models/Cart');
const Order = require('../src/models/Order');
const Interaction = require('../src/models/Interaction');

// Simple native HTTP requester to test against Express app
function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, rawData: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('🧪 INTELLICART BACKEND AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intellicart_test';
  await mongoose.connect(mongoUri);
  console.log(`[Tests] Connected to database: ${mongoUri}`);

  // Start temporary test server on random free port
  const server = app.listen(0);
  const testPort = server.address().port;
  console.log(`[Tests] Test server active on http://127.0.0.1:${testPort}\n`);

  let passedCount = 0;
  let failedCount = 0;
  const results = [];

  async function assertTest(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      results.push({ name, status: 'PASSED', duration: `${duration}ms` });
      console.log(`  ✅ [PASS] ${name} (${duration}ms)`);
      passedCount++;
    } catch (err) {
      const duration = Date.now() - start;
      results.push({ name, status: 'FAILED', duration: `${duration}ms`, error: err.message });
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failedCount++;
    }
  }

  try {
    let testUserToken = '';
    let testAdminToken = '';
    let testUserId = '';
    let testProductId = '';
    let testCategoryId = '';

    // 1. Health check
    await assertTest('API Gateway Health Check (GET /api/health)', async () => {
      const res = await makeRequest(server, { path: '/api/health', method: 'GET' });
      if (res.status !== 200 || res.data.status !== 'online') {
        throw new Error(`Expected status 200 and 'online', got ${res.status}`);
      }
    });

    // 2. Setup Category & Product in DB
    await assertTest('Prepare Test Category & Product in Database', async () => {
      let cat = await Category.findOne({ name: 'Test Electronics' });
      if (!cat) {
        cat = await Category.create({ name: 'Test Electronics', slug: 'test-electronics', description: 'Testing category' });
      }
      testCategoryId = cat._id.toString();

      let prod = await Product.findOne({ name: 'Test Smart Laptop' });
      if (!prod) {
        prod = await Product.create({
          name: 'Test Smart Laptop',
          category: cat._id,
          categoryName: cat.name,
          brand: 'TestBrand',
          price: 999,
          discount: 10,
          finalPrice: 899.1,
          description: 'High performance testing device for unit tests',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
          stock: 20,
          tags: ['test', 'laptop', 'tech'],
        });
      }
      testProductId = prod._id.toString();
    });

    // 3. User Registration
    await assertTest('User Registration (POST /api/auth/register)', async () => {
      const testEmail = `tester_${Date.now()}@example.com`;
      const res = await makeRequest(server, { path: '/api/auth/register', method: 'POST' }, {
        name: 'Automated Tester',
        email: testEmail,
        password: 'password123',
        phone: '+91 99999 88888',
        address: { city: 'Bengaluru', country: 'India' },
      });

      if (res.status !== 201 || !res.data.token) {
        throw new Error(`Registration failed with status ${res.status}: ${JSON.stringify(res.data)}`);
      }
      testUserToken = res.data.token;
      testUserId = res.data.user._id;
    });

    // 4. User Login
    await assertTest('User Login (POST /api/auth/login)', async () => {
      // Find our user or register new
      const user = await User.findById(testUserId);
      const res = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
        email: user.email,
        password: 'password123',
      });

      if (res.status !== 200 || !res.data.token) {
        throw new Error(`Login failed with status ${res.status}`);
      }
    });

    // 5. Protected Profile Retrieval
    await assertTest('User Profile Verification (GET /api/auth/me)', async () => {
      const res = await makeRequest(server, {
        path: '/api/auth/me',
        method: 'GET',
        headers: { Authorization: `Bearer ${testUserToken}` },
      });

      if (res.status !== 200 || res.data.user._id !== testUserId) {
        throw new Error(`Profile fetch failed: ${JSON.stringify(res.data)}`);
      }
    });

    // 6. Products Retrieval & Search
    await assertTest('Product Catalog Listing & Filter (GET /api/products)', async () => {
      const res = await makeRequest(server, {
        path: `/api/products?search=Laptop`,
        method: 'GET',
      });

      if (res.status !== 200 || !Array.isArray(res.data.products)) {
        throw new Error(`Product listing failed: ${res.status}`);
      }
    });

    // 7. Cart Operations
    await assertTest('Add Item to Cart (POST /api/cart)', async () => {
      const res = await makeRequest(
        server,
        {
          path: '/api/cart',
          method: 'POST',
          headers: { Authorization: `Bearer ${testUserToken}` },
        },
        { productId: testProductId, quantity: 2 }
      );

      if (res.status !== 200 || res.data.cart.items.length === 0) {
        throw new Error(`Cart add failed: ${JSON.stringify(res.data)}`);
      }
    });

    // 8. Order Creation & Stock Decrement
    await assertTest('Order Placement & Stock Decrement (POST /api/orders)', async () => {
      const prodBefore = await Product.findById(testProductId);
      const initialStock = prodBefore.stock;

      const res = await makeRequest(
        server,
        {
          path: '/api/orders',
          method: 'POST',
          headers: { Authorization: `Bearer ${testUserToken}` },
        },
        {
          orderItems: [{ product: testProductId, quantity: 2 }],
          shippingAddress: {
            fullName: 'Automated Tester',
            phone: '+91 99999 88888',
            address: '12 Test Lane',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
          paymentMethod: 'COD',
        }
      );

      if (res.status !== 201 || !res.data.order) {
        throw new Error(`Order creation failed: ${JSON.stringify(res.data)}`);
      }

      // Check stock decremented
      const prodAfter = await Product.findById(testProductId);
      if (prodAfter.stock !== initialStock - 2) {
        throw new Error(`Expected stock ${initialStock - 2}, found ${prodAfter.stock}`);
      }
    });

    // 9. Interaction Telemetry Recording
    await assertTest('Behavioral Interaction Recording (POST /api/interactions)', async () => {
      const res = await makeRequest(
        server,
        {
          path: '/api/interactions',
          method: 'POST',
          headers: { Authorization: `Bearer ${testUserToken}` },
        },
        {
          productId: testProductId,
          action: 'PRODUCT_VIEW',
          metadata: { device: 'test-runner' },
        }
      );

      if (res.status !== 201 || !res.data.success) {
        throw new Error(`Interaction recording failed: ${JSON.stringify(res.data)}`);
      }
    });

    // 10. AI Recommendation Gateway with Fallback
    await assertTest('AI Recommendations Endpoint (GET /api/recommendations)', async () => {
      const res = await makeRequest(server, {
        path: '/api/recommendations?limit=4',
        method: 'GET',
        headers: { Authorization: `Bearer ${testUserToken}` },
      });

      if (res.status !== 200 || !Array.isArray(res.data.recommendations)) {
        throw new Error(`Recommendation call failed: ${JSON.stringify(res.data)}`);
      }
    });

    // 11. Admin Authorization Protection
    await assertTest('Admin Route Access Guard (GET /api/orders without Admin role)', async () => {
      const res = await makeRequest(server, {
        path: '/api/orders',
        method: 'GET',
        headers: { Authorization: `Bearer ${testUserToken}` }, // Normal USER token
      });

      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for non-admin user, got ${res.status}`);
      }
    });

  } finally {
    server.close();
    await mongoose.connection.close();
  }

  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('[Test Suite Crash]:', err);
  process.exit(1);
});
