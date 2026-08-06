import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../models/database.js'

export async function register(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' })
  }

  try {
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'user']
    )
    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    )
    return res.status(201).json({ token, user })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ message: 'Registration failed.' })
  }
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No account found for that email.' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Incorrect password.' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    )
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Login failed.' })
  }
}
