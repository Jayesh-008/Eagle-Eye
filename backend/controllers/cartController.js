import { query } from '../models/database.js'

export async function getCart(req, res) {
  try {
    const result = await query(
      `SELECT c.id, c.user_id AS "userId", c.product_id AS "productId", c.quantity,
              p.name, p.sale_price AS "salePrice", p.price, p.image, p.category
       FROM cart c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1`,
      [req.user.id]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error('getCart error:', err)
    return res.status(500).json({ message: 'Failed to fetch cart.' })
  }
}

export async function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' })
  }

  try {
    // Upsert: if item already in cart, increment quantity
    const result = await query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
       RETURNING id, user_id AS "userId", product_id AS "productId", quantity`,
      [req.user.id, Number(productId), Number(quantity)]
    )
    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('addToCart error:', err)
    if (err.code === '23503') {
      return res.status(400).json({ message: 'Product no longer exists.' })
    }
    return res.status(500).json({ message: 'Failed to add to cart.' })
  }
}

export async function updateCartItem(req, res) {
  try {
    const result = await query(
      `UPDATE cart SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id AS "userId", product_id AS "productId", quantity`,
      [Number(req.body.quantity || 1), Number(req.params.id), req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cart item not found.' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error('updateCartItem error:', err)
    return res.status(500).json({ message: 'Failed to update cart item.' })
  }
}

export async function removeCartItem(req, res) {
  try {
    const result = await query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [Number(req.params.id), req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cart item not found.' })
    return res.json({ message: 'Cart item removed.' })
  } catch (err) {
    console.error('removeCartItem error:', err)
    return res.status(500).json({ message: 'Failed to remove cart item.' })
  }
}
