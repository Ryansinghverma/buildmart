const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'buildmart-super-secret-jwt-key-2024');

describe('Product Endpoints', () => {
  let adminToken;
  let contractorToken;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'buildmart-super-secret-jwt-key-2024';

    const admin = await User.create({
      name: 'Admin',
      phone: '9000000000',
      role: 'admin'
    });
    adminToken = generateToken(admin._id);

    const contractor = await User.create({
      name: 'Contractor',
      phone: '9111111111',
      role: 'contractor'
    });
    contractorToken = generateToken(contractor._id);

    await Product.create({
      name: 'Cement',
      category: 'Cement',
      unit: 'bag',
      isActive: true
    });
  });

  describe('GET /api/products', () => {
    it('should fetch all active products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Cement');
    });
  });

  describe('POST /api/products', () => {
    it('should allow admin to create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Steel Bar',
          category: 'Steel',
          unit: 'kg'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Steel Bar');
    });

    it('should deny non-admin users from creating products', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          name: 'Sand',
          category: 'Aggregates',
          unit: 'cft'
        });
      
      expect(res.statusCode).toEqual(403);
    });
  });
});
