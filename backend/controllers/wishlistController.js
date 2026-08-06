import { query } from '../models/database.js'

export async function getWishlist(req, res) {
  try {
    const result = await query(
      `SELECT w.id, w.user_id AS "userId", w.product_id AS "productId",
              p.name, p.sale_price AS "salePrice", p.price, p.image, p.category, p.badge
       FROM wishlist w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1`,
      [req.user.id]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error('getWishlist error:', err)
    return res.status(500).json({ message: 'Failed to fetch wishlist.' })
  }
}

export async function addToWishlist(req, res) {
  const { productId } = req.body
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' })
  }

  try {
    const result = await query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO UPDATE SET product_id = EXCLUDED.product_id
       RETURNING id, user_id AS "userId", product_id AS "productId"`,
      [req.user.id, Number(productId)]
    )
    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('addToWishlist error:', err)
    if (err.code === '23503') {
      return res.status(400).json({ message: 'Product no longer exists.' })
    }
    return res.status(500).json({ message: 'Failed to add to wishlist.' })
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const result = await query(
      'DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING id',
      [Number(req.params.id), req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Wishlist item not found.' })
    return res.json({ message: 'Wishlist item removed.' })
  } catch (err) {
    console.error('removeFromWishlist error:', err)
    return res.status(500).json({ message: 'Failed to remove wishlist item.' })
  }
}
