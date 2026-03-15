import { describe, test, expect } from '@jest/globals';
import request from 'supertest';

// Note: These tests require the backend server to be running
// Run with: NODE_ENV=test jest

const BASE_URL = process.env.BACKEND_URL || 'https://bitsy-tools.preview.emergentagent.com';

describe('API Endpoints - Critical Paths', () => {
  describe('Admin Authentication', () => {
    test('POST /api/admin/auth/login - successful login', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({
          email: 'hello@getbitsy.ai',
          password: 'newSecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.admin.email).toBe('hello@getbitsy.ai');
    });

    test('POST /api/admin/auth/login - invalid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({
          email: 'hello@getbitsy.ai',
          password: 'wrong-password'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Public APIs', () => {
    test('GET /api/public/hotels/search - returns results', async () => {
      const response = await request(BASE_URL)
        .get('/api/public/hotels/search')
        .query({ query: 'Miami' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hotels');
      expect(Array.isArray(response.body.hotels)).toBe(true);
    });
  });

  describe('Health Checks', () => {
    test('Backend server is accessible', async () => {
      const response = await request(BASE_URL)
        .get('/api/public/hotels/search')
        .query({ query: 'test' });

      // Any 2xx or 4xx means server is up (5xx would be server error)
      expect(response.status).toBeLessThan(500);
    });
  });
});
