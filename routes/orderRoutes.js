const express = require('express')
const router = express.Router()
const {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getDealerOrders,
  acceptOrder,
  rejectOrder,
} = require('../controllers/orderController')
const { protect, authorise } = require('../middlewares/auth')

// Contractor
router.post('/', protect, authorise('contractor'), createOrder)
router.get('/:userId', protect, getOrdersByUser)

// Admin — all orders
router.get('/', protect, authorise('admin'), getAllOrders)

// Status update — dealers and admins
router.put('/:id/status', protect, authorise('dealer', 'admin'), updateOrderStatus)

// Dealer-specific endpoints
router.get('/dealer/:dealerId', protect, authorise('dealer', 'admin'), getDealerOrders)
router.put('/dealer/:id/accept', protect, authorise('dealer'), acceptOrder)
router.put('/dealer/:id/reject', protect, authorise('dealer'), rejectOrder)

module.exports = router
