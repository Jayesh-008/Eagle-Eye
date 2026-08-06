import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Eagle Eye API is running.' })
})

app.get('/api/products', (_req, res) => {
  res.json([
    {
      id: 1,
      name: 'Aurelia Noir',
      brand: 'Eagle Eye',
      price: 289,
      salePrice: 229,
      category: 'Eyeglasses',
    },
    {
      id: 2,
      name: 'Solstice Gold',
      brand: 'Eagle Eye',
      price: 349,
      salePrice: 299,
      category: 'Sunglasses',
    },
  ])
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
