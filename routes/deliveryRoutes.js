const express = require('express')
const router = express.Router()
const {
  assignDelivery,
  updateDeliveryStatus,
  getDeliveryByOrder,
} = require('../controllers/deliveryController')
const { protect, authorise } = require('../middlewares/auth')

router.post('/assign', protect, authorise('admin'), assignDelivery)
router.get('/:orderId', protect, getDeliveryByOrder)
router.put('/:orderId/status', protect, authorise('admin'), updateDeliveryStatus)

module.exports = router
