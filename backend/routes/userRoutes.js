import express from 'express'
import { deleteUser, getUsers, updateUser } from '../controllers/userController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, requireAdmin, getUsers)
router.put('/:id', authenticate, requireAdmin, updateUser)
router.delete('/:id', authenticate, requireAdmin, deleteUser)

export default router
