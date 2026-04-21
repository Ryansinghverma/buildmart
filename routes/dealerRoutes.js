const express = require('express')
const router = express.Router()
const { getListingsByDealer, upsertListing } = require('../controllers/listingController')
const { getDealerOrders, acceptOrder, rejectOrder } = require('../controllers/orderController')
const { protect, authorise } = require('../middlewares/auth')

// Match the frontend dealerAPI shape exactly
router.get('/:dealerId/listings', protect, getListingsByDealer)
router.put('/listing', protect, authorise('dealer'), upsertListing)
router.get('/:dealerId/orders', protect, authorise('dealer', 'admin'), getDealerOrders)
router.put('/orders/:id/accept', protect, authorise('dealer'), acceptOrder)
router.put('/orders/:id/reject', protect, authorise('dealer'), rejectOrder)

module.exports = router
