import express from 'express'
import { getContactMessages, submitContactMessage } from '../controllers/contactController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/', submitContactMessage)
router.get('/', authenticate, requireAdmin, getContactMessages)

export default router
