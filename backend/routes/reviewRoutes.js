import express from 'express'
import { addReview, getAllReviews, getReviews } from '../controllers/reviewController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getAllReviews)
router.get('/:productId', getReviews)
router.post('/', authenticate, addReview)
router.post('/:productId', authenticate, addReview)

export default router
