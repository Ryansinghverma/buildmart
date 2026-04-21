const express = require('express')
const router = express.Router()
const {
  createListing,
  updateListing,
  getListingsByProduct,
  getListingsByDealer,
  upsertListing,
} = require('../controllers/listingController')
const { protect, authorise } = require('../middlewares/auth')

// GET /api/listings/:productId  — all dealers for a product (public)
router.get('/:productId', getListingsByProduct)

// Dealer-only mutations
router.post('/', protect, authorise('dealer'), createListing)
router.put('/upsert', protect, authorise('dealer'), upsertListing)
router.put('/:id', protect, authorise('dealer'), updateListing)

module.exports = router
