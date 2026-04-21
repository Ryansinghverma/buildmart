const Product = require('../models/Product')
const DealerListing = require('../models/DealerListing')

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query
    const filter = { isActive: true }
    if (category && category !== 'All') filter.category = category

    const products = await Product.find(filter).sort({ category: 1, name: 1 })
    res.json(products)
  } catch (error) {
    next(error)
  }
}

// GET /api/products/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true })
    res.json(['All', ...categories.sort()])
  } catch (error) {
    next(error)
  }
}

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    // Include all active dealer listings for this product
    const listings = await DealerListing.find({
      productId: req.params.id,
      isActive: true,
    }).populate('dealerId', 'name phone address')

    res.json({ ...product.toObject(), dealers: listings })
  } catch (error) {
    next(error)
  }
}

// POST /api/products  (admin only)
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

// PUT /api/products/:id  (admin only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    next(error)
  }
}

module.exports = { getProducts, getCategories, getProductById, createProduct, updateProduct }
