const DealerListing = require('../models/DealerListing')

// POST /api/listings
const createListing = async (req, res, next) => {
  try {
    const { productId, price, stock, deliveryTime } = req.body
    const dealerId = req.user._id

    const listing = await DealerListing.create({
      dealerId,
      productId,
      price,
      stock,
      deliveryTime,
    })

    await listing.populate('productId', 'name category unit')
    res.status(201).json(listing)
  } catch (error) {
    next(error)
  }
}

// PUT /api/listings/:id
const updateListing = async (req, res, next) => {
  try {
    const { price, stock, deliveryTime, isActive } = req.body

    const listing = await DealerListing.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.user._id },
      { price, stock, deliveryTime, isActive },
      { new: true, runValidators: true }
    ).populate('productId', 'name category unit')

    if (!listing) return res.status(404).json({ message: 'Listing not found or not yours' })
    res.json(listing)
  } catch (error) {
    next(error)
  }
}

// GET /api/listings/:productId  — all dealers stocking a product
const getListingsByProduct = async (req, res, next) => {
  try {
    const listings = await DealerListing.find({
      productId: req.params.productId,
      isActive: true,
      stock: { $gt: 0 },
    })
      .populate('dealerId', 'name phone address')
      .sort({ price: 1 })

    res.json(listings)
  } catch (error) {
    next(error)
  }
}

// GET /api/dealer/:dealerId/listings  — all listings by a dealer
const getListingsByDealer = async (req, res, next) => {
  try {
    const listings = await DealerListing.find({ dealerId: req.params.dealerId })
      .populate('productId', 'name category unit image')
      .sort({ createdAt: -1 })

    res.json(listings)
  } catch (error) {
    next(error)
  }
}

// PUT /api/dealer/listing  — upsert (create or update) by dealerId+productId
const upsertListing = async (req, res, next) => {
  try {
    const { productId, price, stock, deliveryTime } = req.body
    const dealerId = req.user._id

    const listing = await DealerListing.findOneAndUpdate(
      { dealerId, productId },
      { price, stock, deliveryTime, isActive: true },
      { new: true, upsert: true, runValidators: true }
    ).populate('productId', 'name category unit')

    res.json(listing)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createListing,
  updateListing,
  getListingsByProduct,
  getListingsByDealer,
  upsertListing,
}
