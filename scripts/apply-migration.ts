import fs from 'fs'
import path from 'path'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
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
      // Continue - some statements may fail if they already exist (e.g. IF NOT EXISTS)
    }
  }

  console.log('\nMigration complete!')
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
