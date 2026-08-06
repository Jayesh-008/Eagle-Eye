import express from 'express'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../controllers/categoryController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getCategories)
router.post('/', authenticate, requireAdmin, createCategory)
router.put('/:id', authenticate, requireAdmin, updateCategory)
router.delete('/:id', authenticate, requireAdmin, deleteCategory)

export default router
