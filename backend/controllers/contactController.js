import { query } from '../models/database.js'

export async function submitContactMessage(req, res) {
  const { name, email, phone, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' })
  }

  try {
    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, message, created_at AS "createdAt"`,
      [name, email, phone || null, message]
    )
    return res.status(201).json({
      message: 'Thank you for reaching out! Your message has been received.',
      contact: result.rows[0],
    })
  } catch (err) {
    console.error('Contact message submission error:', err)
    return res.status(500).json({ message: 'Failed to submit contact message.' })
  }
}

export async function getContactMessages(req, res) {
  try {
    const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC')
    return res.json(result.rows)
  } catch (err) {
    console.error('Fetch contact messages error:', err)
    return res.status(500).json({ message: 'Failed to fetch contact messages.' })
  }
}
