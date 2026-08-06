import { pool } from '../models/database.js'
import { query } from '../models/database.js'

export async function createOrder(req, res) {
  const { shippingAddress, items } = req.body

  if (!shippingAddress || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order details are incomplete.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Lock all product rows and validate stock — FOR UPDATE prevents race conditions
    for (const item of items) {
      const productRes = await client.query(
        'SELECT id, name, stock FROM products WHERE id = $1 FOR UPDATE',
        [Number(item.productId)]
      )

      if (productRes.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: `Product #${item.productId} not found.` })
      }

      const product = productRes.rows[0]
      const requestedQty = Number(item.quantity)

      if (product.stock < requestedQty) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          message: `"${product.name}" only has ${product.stock} unit${product.stock !== 1 ? 's' : ''} left in stock.`,
        })
      }
    }

    // All stock is available — deduct stock for every item
    for (const item of items) {
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [Number(item.quantity), Number(item.productId)]
      )
    }

    // Calculate total and create the order
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, shipping_address, status, total)
       VALUES ($1, $2, 'Pending', $3)
       RETURNING id, user_id AS "userId", shipping_address AS "shippingAddress", status, total, created_at AS "createdAt"`,
      [req.user.id, shippingAddress, total]
    )
    const order = orderResult.rows[0]

    // Insert order items
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, Number(item.productId), Number(item.quantity), Number(item.price)]
      )
    }

    // Clear the user's cart
    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id])

    await client.query('COMMIT')

    order.items = items
    return res.status(201).json(order)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Order error:', err)
    return res.status(500).json({ message: 'Failed to create order.' })
  } finally {
    client.release()
  }
}

export async function getOrders(req, res) {
  try {
    let result
    if (req.user.role === 'admin') {
      result = await query(
        `SELECT o.id, o.user_id AS "userId", o.shipping_address AS "shippingAddress", o.status, o.total, o.created_at AS "createdAt",
                json_agg(json_build_object('productId', oi.product_id, 'quantity', oi.quantity, 'price', oi.price)) AS items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         GROUP BY o.id ORDER BY o.created_at DESC`
      )
    } else {
      result = await query(
        `SELECT o.id, o.user_id AS "userId", o.shipping_address AS "shippingAddress", o.status, o.total, o.created_at AS "createdAt",
                json_agg(json_build_object('productId', oi.product_id, 'quantity', oi.quantity, 'price', oi.price)) AS items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = $1
         GROUP BY o.id ORDER BY o.created_at DESC`,
        [req.user.id]
      )
    }
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to fetch orders.' })
  }
}

export async function updateOrder(req, res) {
  try {
    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2
       RETURNING id, status, total, created_at AS "createdAt"`,
      [req.body.status, Number(req.params.id)]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found.' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to update order.' })
  }
}
