import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:2008@localhost:5432/eagle_eye',
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err)
})

export async function initDb() {
  try {
    const schemaPath = join(__dirname, 'schema.sql')
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8')
      await pool.query(sql)
      console.log('✅ Database schema verified/initialized')
    }
  } catch (err) {
    console.error('⚠️ Schema initialization warning:', err.message)
  }
}

export async function query(text, params) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}
