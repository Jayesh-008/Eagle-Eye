import { query } from '../models/database.js'

export async function getUsers(req, res) {
  try {
    const result = await query('SELECT id, name, email, role, created_at AS "createdAt" FROM users ORDER BY id')
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to fetch users.' })
  }
}

export async function updateUser(req, res) {
  const { name, email, role } = req.body
  try {
    const result = await query(
      'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, name, email, role',
      [name, email, role, Number(req.params.id)]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to update user.' })
  }
}

export async function deleteUser(req, res) {
  try {
    const result = await query('DELETE FROM users WHERE id=$1 RETURNING id', [Number(req.params.id)])
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' })
    return res.json({ message: 'User deleted.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to delete user.' })
  }
}
