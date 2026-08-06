import { query } from '../models/database.js'

// GET /api/reviews -> Returns all customer reviews across all products with product & user names
export async function getAllReviews(req, res) {
  try {
    const result = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at AS "createdAt",
              u.name AS "userName", p.id AS "productId", p.name AS "productName", p.image AS "productImage"
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC`
    )
    return res.json(result.rows)
  } catch (err) {
    console.error('getAllReviews error:', err)
    return res.status(500).json({ message: 'Failed to fetch reviews.' })
  }
}

// GET /api/reviews/:productId -> Returns reviews for a specific product
export async function getReviews(req, res) {
  try {
    const result = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at AS "createdAt", u.name AS "userName"
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [req.params.productId]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error('getReviews error:', err)
    return res.status(500).json({ message: 'Failed to fetch product reviews.' })
  }
}

// POST /api/reviews -> Submit a review for a product
export async function addReview(req, res) {
  const { productId, rating, comment } = req.body
  const pId = productId || req.params.productId

  if (!pId || !rating || !comment || comment.trim().length === 0) {
    return res.status(400).json({ message: 'Product ID, 1-5 star rating, and a review comment are required.' })
  }

  const numericRating = Number(rating)
  if (numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5 stars.' })
  }

  try {
    const result = await query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, rating, comment, created_at AS "createdAt"`,
      [req.user.id, Number(pId), numericRating, comment.trim()]
    )

    // Recalculate average rating for this product and update products table
    const avgResult = await query(
      `SELECT AVG(rating)::numeric(3,1) AS avg_rating, COUNT(*) AS count
       FROM reviews WHERE product_id = $1`,
      [Number(pId)]
    )

    if (avgResult.rows.length > 0) {
      await query(
        `UPDATE products SET rating = $1 WHERE id = $2`,
        [Number(avgResult.rows[0].avg_rating), Number(pId)]
      )
    }

    const review = result.rows[0]
    review.userName = req.user.name
    return res.status(201).json(review)
  } catch (err) {
    console.error('addReview error:', err)
    return res.status(500).json({ message: 'Failed to add review.' })
  }
}
