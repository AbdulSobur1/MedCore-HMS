import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let db: any = null
let dbInitialized = false

export function getDb() {
  if (dbInitialized) return db
  if (!process.env.DATABASE_URL) return null

  try {
    const sql = neon(process.env.DATABASE_URL)
    db = drizzle({ client: sql, schema })
    dbInitialized = true
    return db
  } catch {
    return null
  }
}
