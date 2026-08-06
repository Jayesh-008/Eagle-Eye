import jwt from 'jsonwebtoken'
import { query } from '../models/database.js'

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing. Please sign in.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    const userId = Number(decoded.id)

    // Check if user ID is a valid 32-bit integer (max 2147483647)
    if (!Number.isInteger(userId) || userId <= 0 || userId > 2147483647) {
      return res.status(401).json({ message: 'User session expired. Please sign in again.' })
    }

    // Check if user exists in PostgreSQL DB
    const userRes = await query('SELECT id, name, email, role FROM users WHERE id = $1', [userId])
    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'User session expired. Please sign in again.' })
    }

    req.user = userRes.rows[0]
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please sign in again.' })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' })
  }

  next()
}
