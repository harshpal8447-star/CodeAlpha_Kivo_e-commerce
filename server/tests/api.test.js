import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';

describe('Kivo E-Commerce API Suite', () => {
  let customerToken = '';
  let adminToken = '';
  let testProductId = '';

  beforeAll(async () => {
    // Obtain tokens from seeded accounts
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kivo.com', password: 'AdminPassword123!' });

    if (adminRes.body.data) {
      adminToken = adminRes.body.data.token;
    }

    const customerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.mitchell@example.com', password: 'Customer123!' });

    if (customerRes.body.data) {
      customerToken = customerRes.body.data.token;
    }

    const productsRes = await request(app).get('/api/products');
    if (productsRes.body.data?.products?.length > 0) {
      testProductId = productsRes.body.data.products[0].id;
    }
  });

  describe('1. System Health Endpoint', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.brand).toBe('Kivo E-Commerce');
    });
  });

  describe('2. Products & Catalogue API', () => {
    it('should list products with pagination and category metadata', async () => {
      const res = await request(app).get('/api/products?page=1&limit=6');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should fetch single product details and related products', async () => {
      const res = await request(app).get(`/api/products/${testProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.id).toBe(testProductId);
      expect(Array.isArray(res.body.data.related)).toBe(true);
    });

    it('should filter products by search term', async () => {
      const res = await request(app).get('/api/products?search=Headphones');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Authentication & Security', () => {
    it('should register a new unique customer account', async () => {
      const testEmail = `buyer_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: testEmail,
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Sarah',
          email: 'sarah.mitchell@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject access to protected route without auth token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow access to protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('sarah.mitchell@example.com');
    });
  });

  describe('4. Authorization & Admin Access Control', () => {
    it('should deny non-admin users from accessing admin metrics', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin users to access admin metrics and summaries', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
    });
  });

  describe('5. Cart and Inventory Management', () => {
    it('should add product to cart and calculate totals', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProductId, quantity: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data.cart.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.cart.total).toBeGreaterThan(0);
    });

    it('should reject adding more quantity than available stock', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProductId, quantity: 99999 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. Order Processing and Checkout Transactions', () => {
    it('should reject order creation if shipping address is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentMethod: 'DEMO_PAYMENT',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully place an order and create an atomic transaction', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddress: {
            fullName: 'Sarah Mitchell',
            street: '742 Evergreen Terrace',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'United States',
          },
          paymentMethod: 'DEMO_PAYMENT',
          paymentSimulation: 'SUCCESS',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderNumber).toMatch(/^KV-\d{4}-\d+$/);
      expect(res.body.data.order.paymentStatus).toBe('COMPLETED');
    });

    it('should correctly handle failed simulated payment without marking order confirmed', async () => {
      // First re-add an item to cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProductId, quantity: 1 });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddress: {
            fullName: 'Sarah Mitchell',
            street: '742 Evergreen Terrace',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'United States',
          },
          paymentMethod: 'DEMO_PAYMENT',
          paymentSimulation: 'FAILED',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.data.order.paymentStatus).toBe('FAILED');
      expect(res.body.data.order.status).toBe('CANCELLED');
    });
  });
});
