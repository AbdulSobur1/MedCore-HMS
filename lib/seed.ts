import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from './db'
import * as schema from './schema'

async function main() {
  console.log('Seeding MedCore HMS admin account...')

  const name = process.env.SEED_ADMIN_NAME
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const phone = process.env.SEED_ADMIN_PHONE

  if (!name || !email || !password) {
    throw new Error('Set SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD before running seed.')
  }

  const existing = await db.select().from(schema.staff).where(eq(schema.staff.email, email)).limit(1)
  if (existing.length > 0) {
    console.log(`Admin already exists for ${email}. No changes made.`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await db.insert(schema.staff).values({
    name,
    email,
    passwordHash,
    role: 'admin',
    department: 'Administration',
    phone: phone || null,
  })

  console.log(`Admin user created for ${email}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
