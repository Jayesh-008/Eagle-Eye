import { query } from '../models/database.js'

export async function getCategories(req, res) {
  try {
    const result = await query('SELECT * FROM categories ORDER BY id')
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to fetch categories.' })
  }
}

export async function createCategory(req, res) {
  const { name, description, image, rating, discount } = req.body
  try {
    const result = await query(
      'INSERT INTO categories (name, description, image, rating, discount) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, description, image, Number(rating || 4.5), discount]
    )
    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to create category.' })
  }
}

export async function updateCategory(req, res) {
  const { name, description, image, rating, discount } = req.body
  try {
    const result = await query(
      'UPDATE categories SET name=$1, description=$2, image=$3, rating=$4, discount=$5 WHERE id=$6 RETURNING *',
      [name, description, image, Number(rating || 4.5), discount, Number(req.params.id)]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found.' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to update category.' })
  }
}

export async function deleteCategory(req, res) {
  try {
    const result = await query('DELETE FROM categories WHERE id=$1 RETURNING id', [Number(req.params.id)])
    if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found.' })
    return res.json({ message: 'Category deleted.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to delete category.' })
  }
}
