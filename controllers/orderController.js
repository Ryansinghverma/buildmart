const Order = require('../models/Order')
const DealerListing = require('../models/DealerListing')
const CreditLedger = require('../models/CreditLedger')
const User = require('../models/User')

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentType, projectId } = req.body
    const contractorId = req.user._id

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' })
    }

    // Validate stock and calculate total
    let totalAmount = 0
    for (const item of items) {
      const listing = await DealerListing.findOne({
        dealerId: item.dealerId,
        productId: item.productId,
        isActive: true,
      })
      if (!listing) {
        return res.status(400).json({
          message: `No active listing found for product ${item.productId} from dealer ${item.dealerId}`,
        })
      }
      if (listing.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock. Available: ${listing.stock}`,
        })
      }
      item.price = listing.price
      totalAmount += listing.price * item.quantity
    }

    // Credit check
    if (paymentType === 'credit') {
      const contractor = await User.findById(contractorId)
      const pendingCredit = await CreditLedger.aggregate([
        { $match: { contractorId, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      const usedCredit = pendingCredit[0]?.total || 0
      if (usedCredit + totalAmount > contractor.creditLimit) {
        return res.status(400).json({ message: 'Credit limit exceeded' })
      }
    }

    const order = await Order.create({
      contractorId,
      items,
      totalAmount,
      deliveryAddress,
      paymentType,
      projectId: projectId || null,
    })

    // Deduct stock
    for (const item of items) {
      await DealerListing.findOneAndUpdate(
        { dealerId: item.dealerId, productId: item.productId },
        { $inc: { stock: -item.quantity } }
      )
    }

    // Create credit ledger entry if payment is on credit
    if (paymentType === 'credit') {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)
      await CreditLedger.create({
        contractorId,
        orderId: order._id,
        amount: totalAmount,
        dueDate,
      })
    }

    await order.populate([
      { path: 'contractorId', select: 'name phone' },
      { path: 'items.productId', select: 'name unit' },
      { path: 'items.dealerId', select: 'name phone' },
    ])

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

// GET /api/orders/:userId
const getOrdersByUser = async (req, res, next) => {
  try {
    const { status } = req.query
    const filter = { contractorId: req.params.userId }
    if (status) filter.status = status

    const orders = await Order.find(filter)
      .populate('items.productId', 'name unit image')
      .populate('items.dealerId', 'name phone')
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    next(error)
  }
}

// GET /api/orders  — all orders (admin) or dealer's orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, dealerId } = req.query
    const filter = {}
    if (status) filter.status = status
    if (dealerId) filter['items.dealerId'] = dealerId

    const orders = await Order.find(filter)
      .populate('contractorId', 'name phone')
      .populate('items.productId', 'name unit')
      .populate('items.dealerId', 'name phone')
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    next(error)
  }
}

// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validTransitions = {
      pending: ['accepted', 'cancelled'],
      accepted: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered'],
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const allowed = validTransitions[order.status]
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot move order from '${order.status}' to '${status}'`,
      })
    }

    order.status = status
    await order.save()

    res.json(order)
  } catch (error) {
    next(error)
  }
}

// GET /api/dealer/:dealerId/orders
const getDealerOrders = async (req, res, next) => {
  try {
    const { status } = req.query
    const filter = { 'items.dealerId': req.params.dealerId }
    if (status) filter.status = status

    const orders = await Order.find(filter)
      .populate('contractorId', 'name phone address')
      .populate('items.productId', 'name unit')
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    next(error)
  }
}

// PUT /api/dealer/orders/:id/accept
const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (error) {
    next(error)
  }
}

// PUT /api/dealer/orders/:id/reject
const rejectOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getDealerOrders,
  acceptOrder,
  rejectOrder,
}
