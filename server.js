require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/errorHandler')

const authRoutes     = require('./routes/authRoutes')
const userRoutes     = require('./routes/userRoutes')
const productRoutes  = require('./routes/productRoutes')
const listingRoutes  = require('./routes/listingRoutes')
const orderRoutes    = require('./routes/orderRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')
const dealerRoutes   = require('./routes/dealerRoutes')
const projectRoutes  = require('./routes/projectRoutes')
const creditRoutes   = require('./routes/creditRoutes')

// ─── Database ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  connectDB()
}

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

app.use('/api/auth',     authRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/dealer',   dealerRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/credit',   creditRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use(errorHandler)

const PORT = process.env.PORT || 5000
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 BuildMart API running on port ${PORT} [${process.env.NODE_ENV}]`)
  })
}

module.exports = app
