import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { pool, initDb } from './models/database.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import userRoutes from './routes/userRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import contactRoutes from './routes/contactRoutes.js'

import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', message: 'Eagle Eye API is running.', db: 'PostgreSQL connected ✅' })
  } catch {
    res.status(500).json({ status: 'error', message: 'Database connection failed', db: 'PostgreSQL ❌' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/contact', contactRoutes)

// Serve frontend dist static assets in production or when dist folder exists
const possibleDistPaths = [
  join(__dirname, '../dist'),
  join(__dirname, 'dist'),
  join(__dirname, '../public'),
  join(__dirname, 'public')
]
const distPath = possibleDistPaths.find((p) => fs.existsSync(join(p, 'index.html')))

if (distPath) {
  console.log(`📦 Serving frontend static assets from: ${distPath}`)
  app.use(express.static(distPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(join(distPath, 'index.html'))
  })
} else {
  console.warn('⚠️ Frontend dist folder not found!')
  app.get('/', (_req, res) => {
    res.send('Eagle Eye Backend API is running. (Note: Frontend static build not found).')
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1')
    await initDb()
    console.log(`✅ PostgreSQL connected`)
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message)
    console.error('Check your DATABASE_URL in .env')
  }
})
