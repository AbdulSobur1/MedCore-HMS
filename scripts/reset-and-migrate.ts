import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log('Dropping old tables from conflicting schema...')

  // Drop old-format tables (order matters due to foreign keys)
  const dropTables = [
    'prescription_drugs',
    'prescriptions',
    'appointments',
    'invoices',
    'patients',
    'drugs',
    'staff_invites',
    'staff',
    'audit_logs',
    'otps',
    'hospital_settings',
    'inventory',
  ]

  for (const table of dropTables) {
    try {
      await sql.query(`DROP TABLE IF EXISTS "${table}" CASCADE`)
      console.log(`  ✓ Dropped table: ${table}`)
    } catch (err: any) {
      console.log(`  - Skipped ${table} (may not exist): ${err.message}`)
    }
  }

  // Drop old enums
  const dropEnums = [
    'appointment_status',
    'invoice_status',
    'prescription_status',
    'role',
    'patient_status',
  ]

  for (const enumName of dropEnums) {
    try {
      await sql.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`)
      console.log(`  ✓ Dropped enum: ${enumName}`)
    } catch (err: any) {
      console.log(`  - Skipped enum ${enumName}: ${err.message}`)
    }
  }

  console.log('\nApplying new schema migration...')

  const migrationPath = path.resolve('lib/db/migrations/0000_confused_roland_deschain.sql')
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

  const statements = migrationSql
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  console.log(`Found ${statements.length} SQL statements to execute...`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    try {
      await sql.query(stmt)
      console.log(`  ✓ Statement ${i + 1}/${statements.length} executed successfully`)
    } catch (err: any) {
      console.error(`  ✗ Statement ${i + 1}/${statements.length} FAILED:`, err.message)
      process.exit(1)
    }
  }

  console.log('\n✅ Migration complete! All tables created with correct schema.')
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
