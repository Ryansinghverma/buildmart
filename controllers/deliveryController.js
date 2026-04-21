const Delivery = require('../models/Delivery')
const Order = require('../models/Order')

// POST /api/delivery/assign
const assignDelivery = async (req, res, next) => {
  try {
    const { orderId, driverName, vehicleType, eta } = req.body

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.status !== 'accepted') {
      return res.status(400).json({ message: 'Order must be accepted before assigning delivery' })
    }

    const existing = await Delivery.findOne({ orderId })
    if (existing) return res.status(400).json({ message: 'Delivery already assigned for this order' })

    const delivery = await Delivery.create({ orderId, driverName, vehicleType, eta })

    // Move order to out_for_delivery
    order.status = 'out_for_delivery'
    await order.save()

    res.status(201).json(delivery)
  } catch (error) {
    next(error)
  }
}

// PUT /api/orders/:id/delivery  — update delivery status
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, eta } = req.body

    const delivery = await Delivery.findOneAndUpdate(
      { orderId: req.params.id },
      { status, ...(eta && { eta }) },
      { new: true, runValidators: true }
    )
    if (!delivery) return res.status(404).json({ message: 'Delivery record not found' })

    // Sync order status when delivery is complete
    if (status === 'delivered') {
      await Order.findByIdAndUpdate(req.params.id, { status: 'delivered' })
    }

    res.json(delivery)
  } catch (error) {
    next(error)
  }
}

// GET /api/delivery/:orderId
const getDeliveryByOrder = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ orderId: req.params.orderId }).populate(
      'orderId',
      'status totalAmount deliveryAddress'
    )
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' })
    res.json(delivery)
  } catch (error) {
    next(error)
  }
}

module.exports = { assignDelivery, updateDeliveryStatus, getDeliveryByOrder }
