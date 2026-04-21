const express = require('express')
const router = express.Router()
const {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
} = require('../controllers/productController')
const { protect, authorise } = require('../middlewares/auth')

// Public — contractors browse products without auth
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/:id', getProductById)

// Admin only
router.post('/', protect, authorise('admin'), createProduct)
router.put('/:id', protect, authorise('admin'), updateProduct)

module.exports = router
