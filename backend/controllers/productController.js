import { query } from '../models/database.js'

export async function getProducts(req, res) {
  const { search = '', category = '', minPrice, maxPrice, page = 1, limit = 100 } = req.query

  const conditions = []
  const params = []
  let i = 1

  if (search) {
    conditions.push(`(LOWER(p.name) LIKE LOWER($${i}) OR LOWER(p.description) LIKE LOWER($${i}))`)
    params.push(`%${search}%`)
    i++
  }
  if (category && category !== 'All Collections') {
    conditions.push(`p.category = $${i}`)
    params.push(category)
    i++
  }
  if (minPrice) {
    conditions.push(`p.sale_price >= $${i}`)
    params.push(Number(minPrice))
    i++
  }
  if (maxPrice) {
    conditions.push(`p.sale_price <= $${i}`)
    params.push(Number(maxPrice))
    i++
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const countResult = await query(`SELECT COUNT(*) FROM products p ${where}`, params)
  const total = Number(countResult.rows[0].count)

  const offset = (Number(page) - 1) * Number(limit)
  params.push(Number(limit), offset)

  const result = await query(
    `SELECT p.id, p.name, p.brand, p.price, p.sale_price AS "salePrice", p.category, p.badge, p.image, p.description,
            p.material, p.color, p.lens_width AS "lensWidth", p.bridge_width AS "bridgeWidth",
            p.temple_length AS "templeLength", p.weight, p.warranty, p.price_note AS "priceNote", p.stock,
            ROUND(AVG(r.rating)::numeric, 1)::float AS rating,
            COUNT(r.id)::int AS "reviewCount"
     FROM products p
     LEFT JOIN reviews r ON r.product_id = p.id
     ${where}
     GROUP BY p.id
     ORDER BY p.id LIMIT $${i} OFFSET $${i + 1}`,
    params
  )

  return res.json({
    products: result.rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    currentPage: Number(page),
  })
}

export async function getProductById(req, res) {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.brand, p.price, p.sale_price AS "salePrice", p.category, p.badge, p.image, p.description,
              p.material, p.color, p.lens_width AS "lensWidth", p.bridge_width AS "bridgeWidth",
              p.temple_length AS "templeLength", p.weight, p.warranty, p.price_note AS "priceNote", p.stock,
              ROUND(AVG(r.rating)::numeric, 1)::float AS rating,
              COUNT(r.id)::int AS "reviewCount"
       FROM products p
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to fetch product.' })
  }
}

export async function createProduct(req, res) {
  const { name, brand = 'Eagle Eye', price, salePrice, rating = 4.5, category = 'Eyeglasses', badge = 'New', image = '', description = '', material = '', color = '', stock = 50 } = req.body

  if (!name || !price) {
    return res.status(400).json({ message: 'Product name and price are required.' })
  }

  try {
    const result = await query(
      `INSERT INTO products (name, brand, price, sale_price, rating, category, badge, image, description, material, color, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, name, brand, price, sale_price AS "salePrice", rating, category, badge, image, description, material, color, stock`,
      [name, brand, Number(price), Number(salePrice || price), Number(rating), category, badge, image, description, material, color, Number(stock)]
    )
    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createProduct error:', err)
    return res.status(500).json({ message: 'Failed to create product.' })
  }
}

export async function updateProduct(req, res) {
  const { name, brand, price, salePrice, rating, category, badge, image, description, stock } = req.body
  try {
    const result = await query(
      `UPDATE products SET name=$1, brand=$2, price=$3, sale_price=$4, rating=$5, category=$6, badge=$7, image=$8, description=$9, stock=$10
       WHERE id=$11 RETURNING id, name, brand, price, sale_price AS "salePrice", rating, category, badge, image, stock`,
      [name, brand, Number(price), Number(salePrice || price), Number(rating || 4.5), category, badge, image, description, Math.max(0, Number(stock || 0)), req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error('updateProduct error:', err)
    return res.status(500).json({ message: 'Failed to update product.' })
  }
}

export async function updateStock(req, res) {
  const { stock } = req.body
  try {
    const result = await query(
      `UPDATE products SET stock=$1 WHERE id=$2 RETURNING id, name, stock`,
      [Math.max(0, Number(stock)), req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error('updateStock error:', err)
    return res.status(500).json({ message: 'Failed to update product stock.' })
  }
}

export async function deleteProduct(req, res) {
  try {
    const result = await query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' })
    return res.json({ message: 'Product deleted successfully.' })
  } catch (err) {
    console.error('deleteProduct error:', err)
    return res.status(500).json({ message: 'Failed to delete product.' })
  }
}
