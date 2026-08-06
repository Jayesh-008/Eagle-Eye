import express from 'express'
import { createOrder, getOrders, updateOrder } from '../controllers/orderController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authenticate, createOrder)
router.get('/', authenticate, getOrders)
router.put('/:id', authenticate, requireAdmin, updateOrder)

export default router
