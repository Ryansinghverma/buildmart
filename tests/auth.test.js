const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should create an account and generate OTP', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test Contractor',
          phone: '9876543210',
          role: 'contractor'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should return a token for valid OTP', async () => {
      await User.create({
        name: 'Verify Test',
        phone: '9999999999',
        role: 'dealer',
        otp: {
          code: '123456',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        }
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '9999999999',
          otp: '123456'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.role).toBe('dealer');
    });
  });
});
