const express = require('express')
const router = express.Router()
const { getCreditLedger, markAsPaid, updateCreditLimit } = require('../controllers/creditController')
const { protect, authorise } = require('../middlewares/auth')

router.get('/:contractorId', protect, getCreditLedger)
router.put('/:id/pay', protect, authorise('admin'), markAsPaid)
router.put('/limit/:userId', protect, authorise('admin'), updateCreditLimit)

module.exports = router
