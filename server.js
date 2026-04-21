require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/errorHandler')

// ─── Route imports ──────────────────────────────────────────────────────────
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
connectDB()

const app = express()

// ─── Core middleware ─────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/dealer',   dealerRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/credit',   creditRoutes)

// ─── 404 fallthrough ─────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 BuildMart API running on port ${PORT} [${process.env.NODE_ENV}]`)
})
