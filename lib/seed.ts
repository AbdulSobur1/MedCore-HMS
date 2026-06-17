import { db } from './db'
import * as schema from './schema'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding MedCore HMS database...')

  // Clear existing data
  await db.delete(schema.prescriptionDrugs)
  await db.delete(schema.prescriptions)
  await db.delete(schema.appointments)
  await db.delete(schema.invoices)
  await db.delete(schema.drugs)
  await db.delete(schema.patients)
  await db.delete(schema.staffInvites)
  await db.delete(schema.staff)

  // ── Admin only ──
  const adminHash = await bcrypt.hash('Abdulsobur1.', 10)

  const [admin] = await db.insert(schema.staff).values({
    name: 'Dr. Abdulsobur',
    email: 'abdullahabdulsobur@gmail.com',
    passwordHash: adminHash,
    role: 'admin',
    department: 'Administration',
    phone: '+234-800-000-0001',
  }).returning()

  console.log('✅ Admin user seeded')
  console.log('')
  console.log('🎉 MedCore HMS seeding complete!')
  console.log('')
  console.log('📋 Admin Credentials:')
  console.log('   Email: abdullahabdulsobur@gmail.com')
  console.log('   Password: Abdulsobur1.')
}

main().catch(console.error)
