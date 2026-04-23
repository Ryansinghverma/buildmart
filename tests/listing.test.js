const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const DealerListing = require('../models/DealerListing');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'buildmart-super-secret-jwt-key-2024');

describe('Dealer Listing Endpoints', () => {
  let dealerToken;
  let dealerId;
  let productId;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'buildmart-super-secret-jwt-key-2024';

    const dealer = await User.create({
      name: 'Test Dealer',
      phone: '9888888888',
      role: 'dealer'
    });
    dealerId = dealer._id;
    dealerToken = generateToken(dealerId);

    const product = await Product.create({
      name: 'Bricks',
      category: 'Bricks',
      unit: 'piece'
    });
    productId = product._id;
  });

  describe('POST /api/listings', () => {
    it('should create a listing for a dealer', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send({
          productId,
          price: 15,
          stock: 5000,
          deliveryTime: '1 day'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.price).toBe(15);
    });

    it('should prevent non-dealers from creating listings', async () => {
      const contractor = await User.create({
        name: 'Contractor',
        phone: '9111111111',
        role: 'contractor'
      });
      const contractorToken = generateToken(contractor._id);

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          productId,
          price: 15,
          stock: 5000
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /api/listings/upsert', () => {
    it('should update existing listing or create if not found', async () => {
      const res1 = await request(app)
        .put('/api/listings/upsert')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send({
          productId,
          price: 20,
          stock: 1000
        });

      expect(res1.statusCode).toEqual(200);
      expect(res1.body.price).toBe(20);

      const res2 = await request(app)
        .put('/api/listings/upsert')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send({
          productId,
          price: 25,
          stock: 2000
        });

      expect(res2.statusCode).toEqual(200);
      expect(res2.body.price).toBe(25);
      
      const count = await DealerListing.countDocuments({ dealerId, productId });
      expect(count).toBe(1);
    });
  });
});
