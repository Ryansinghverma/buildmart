const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const DealerListing = require('../models/DealerListing');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'buildmart-super-secret-jwt-key-2024');

describe('Order Endpoints', () => {
  let contractorToken;
  let dealerId;
  let productId;

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'buildmart-super-secret-jwt-key-2024';

    const contractor = await User.create({
      name: 'Contractor',
      phone: '9888888888',
      role: 'contractor'
    });
    contractorToken = generateToken(contractor._id);

    const dealer = await User.create({
      name: 'Dealer',
      phone: '9999999999',
      role: 'dealer'
    });
    dealerId = dealer._id;

    const product = await Product.create({
      name: 'Cement',
      category: 'Cement',
      unit: 'bag'
    });
    productId = product._id;

    await DealerListing.create({
      dealerId,
      productId,
      price: 350,
      stock: 100,
      deliveryTime: '2 days',
      isActive: true
    });
  });

  describe('POST /api/orders', () => {
    it('should successfully create an order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          items: [{ dealerId, productId, quantity: 10 }],
          paymentType: 'cash',
          deliveryAddress: '123 Test St'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.totalAmount).toBe(3500);

      const listing = await DealerListing.findOne({ dealerId, productId });
      expect(listing.stock).toBe(90);
    });

    it('should trigger fallback logic if exact dealer is missing', async () => {
      const newDealer = await User.create({ name: 'Fallback', phone: '9000000000', role: 'dealer' });
      await DealerListing.create({
        dealerId: newDealer._id,
        productId,
        price: 300,
        stock: 500,
        isActive: true
      });

      const fakeDealerId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          items: [{ dealerId: fakeDealerId, productId, quantity: 10 }],
          paymentType: 'cash',
          deliveryAddress: '123 Test St'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.items[0].dealerId._id.toString()).toBe(newDealer._id.toString());
      expect(res.body.totalAmount).toBe(3000);
    });

    it('should return errors for invalid product', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          items: [{ dealerId, productId: fakeProductId, quantity: 1 }],
          paymentType: 'cash',
          deliveryAddress: '123 Test St'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0]).toContain('no longer sold by this dealer');
    });
  });
});
