import express from 'express'
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct, updateStock } from '../controllers/productController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', authenticate, requireAdmin, createProduct)
router.put('/:id', authenticate, requireAdmin, updateProduct)
router.put('/:id/stock', authenticate, requireAdmin, updateStock)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
