import express from 'express'
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, getWishlist)
router.post('/', authenticate, addToWishlist)
router.delete('/:id', authenticate, removeFromWishlist)

export default router
