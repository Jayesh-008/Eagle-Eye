import pg from 'pg'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { categoriesSeed, productsSeed } from './utils/mockData.js'

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:2008@localhost:5432/eagle_eye' })

async function seed() {
  const client = await pool.connect()
  try {
    console.log('🌱 Initializing schema...')
    const schemaPath = join(__dirname, 'models', 'schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    await client.query(sql)

    console.log('🌱 Seeding database...')

    // Seed categories
    for (const cat of categoriesSeed) {
      await client.query(
        `INSERT INTO categories (name, description, image, rating, discount)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE
         SET description=EXCLUDED.description, image=EXCLUDED.image, rating=EXCLUDED.rating, discount=EXCLUDED.discount`,
        [cat.name, cat.description, cat.image, cat.rating, cat.discount]
      )
    }
    console.log(`✅ ${categoriesSeed.length} categories seeded`)

    // Seed products
    for (const p of productsSeed) {
      await client.query(
        `INSERT INTO products (id, name, brand, price, sale_price, rating, category, badge, image, description, material, color, lens_width, bridge_width, temple_length, weight, warranty, price_note)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (id) DO UPDATE
         SET name=EXCLUDED.name, brand=EXCLUDED.brand, price=EXCLUDED.price, sale_price=EXCLUDED.sale_price,
             rating=EXCLUDED.rating, category=EXCLUDED.category, badge=EXCLUDED.badge, image=EXCLUDED.image,
             description=EXCLUDED.description, material=EXCLUDED.material, color=EXCLUDED.color`,
        [p.id, p.name, p.brand, p.price, p.salePrice, p.rating, p.category, p.badge, p.image, p.description,
         p.material, p.color, p.lensWidth, p.bridgeWidth, p.templeLength, p.weight, p.warranty, p.priceNote]
      )
    }
    console.log(`✅ ${productsSeed.length} products seeded`)

    // Reset the products sequence so new products don't conflict
    await client.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`)

    // Seed admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET role = 'admin', password = EXCLUDED.password`,
      ['Jayesh', 'jayeshsubramani008@gmail.com', adminPassword, 'admin']
    )
    console.log('✅ Admin user seeded (email: jayeshsubramani008@gmail.com, password: admin123)')

    console.log('\n🎉 Database seeded successfully!')
  } catch (err) {
    console.error('❌ Seed error:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
