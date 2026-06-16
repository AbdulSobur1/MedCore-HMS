import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { getDb } from './db'
import * as schema from './schema'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const OBJECT_FILES = new Set(['patients.json', 'staff.json', 'otps.json', 'settings.json'])

// -------------------------------------------------------
// JSON file helpers (fallback when Neon is not configured)
// -------------------------------------------------------

export async function readDataFile<T>(filename: string): Promise<T> {
  try {
    const filePath = path.join(DATA_DIR, filename)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    if (OBJECT_FILES.has(filename)) return {} as T
    return [] as T
  }
}

export async function writeDataFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// -------------------------------------------------------
// Neon database layer (used when DATABASE_URL is set)
// Uses static imports from lib/db.ts (no dynamic import())
// -------------------------------------------------------

export { eq, and, gte, lte }

// Patient helpers
export async function getAllPatients() {
  const db = getDb()
  if (db) {
    return db.select().from(schema.patients)
  }
  const data = await readDataFile<Record<string, any>>('patients.json')
  return Object.values(data)
}

export async function getPatientById(patientId: string) {
  const db = getDb()
  if (db) {
    const result = await db.select().from(schema.patients).where(eq(schema.patients.patientId, patientId)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('patients.json')
  return data[patientId] || null
}

export async function getPatientByEmail(email: string) {
  const db = getDb()
  if (db) {
    const result = await db.select().from(schema.patients).where(eq(schema.patients.email, email)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('patients.json')
  return Object.values(data).find((p: any) => p.email === email) || null
}

export async function createPatient(data: any) {
  const db = getDb()
  if (db) {
    const result = await db.insert(schema.patients).values(data).returning()
    return result[0]
  }
  const patients = await readDataFile<Record<string, any>>('patients.json')
  patients[data.patientId] = data
  await writeDataFile('patients.json', patients)
  return data
}

// Staff helpers
export async function getAllStaff() {
  const db = getDb()
  if (db) {
    return db.select().from(schema.staff)
  }
  const data = await readDataFile<Record<string, any>>('staff.json')
  return Object.values(data)
}

export async function getStaffByEmail(email: string) {
  const db = getDb()
  if (db) {
    const result = await db.select().from(schema.staff).where(eq(schema.staff.email, email)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('staff.json')
  return Object.values(data).find((s: any) => s.email === email) || null
}

export async function getDoctors() {
  const db = getDb()
  if (db) {
    return db.select().from(schema.staff).where(eq(schema.staff.role, 'doctor'))
  }
  const data = await readDataFile<Record<string, any>>('staff.json')
  return Object.values(data).filter((s: any) => s.role === 'doctor')
}

export async function createStaff(data: any) {
  const db = getDb()
  if (db) {
    const result = await db.insert(schema.staff).values(data).returning()
    return result[0]
  }
  const staffProfiles = await readDataFile<Record<string, any>>('staff.json')
  staffProfiles[data.staffId] = data
  await writeDataFile('staff.json', staffProfiles)
  return data
}

// OTP helpers
export async function getOTP(email: string) {
  const db = getDb()
  if (db) {
    const result = await db.select().from(schema.otps).where(eq(schema.otps.email, email)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('otps.json')
  return data[email] || null
}

export async function setOTP(email: string, code: string, expiresAt: string) {
  const db = getDb()
  if (db) {
    await db.insert(schema.otps).values({ email, code, expiresAt }).onConflictDoUpdate({
      target: schema.otps.email,
      set: { code, expiresAt },
    })
    return
  }
  const data = await readDataFile<Record<string, any>>('otps.json')
  data[email] = { code, expiresAt }
  await writeDataFile('otps.json', data)
}

export async function deleteOTP(email: string) {
  const db = getDb()
  if (db) {
    await db.delete(schema.otps).where(eq(schema.otps.email, email))
    return
  }
  const data = await readDataFile<Record<string, any>>('otps.json')
  delete data[email]
  await writeDataFile('otps.json', data)
}

// Appointment helpers
export async function getAppointments(dateFilter?: string) {
  const db = getDb()
  if (db) {
    if (dateFilter) {
      return db.select().from(schema.appointments).where(eq(schema.appointments.date, dateFilter))
    }
    return db.select().from(schema.appointments)
  }
  const data = await readDataFile<any[]>('appointments.json')
  if (dateFilter) return data.filter((a: any) => a.date === dateFilter)
  return data
}

export async function createAppointment(data: any) {
  const db = getDb()
  if (db) {
    const result = await db.insert(schema.appointments).values(data).returning()
    return result[0]
  }
  const appointments = await readDataFile<any[]>('appointments.json')
  appointments.push(data)
  await writeDataFile('appointments.json', appointments)
  return data
}

export async function getPatientAppointments(patientId: string) {
  const db = getDb()
  if (db) {
    return db.select().from(schema.appointments).where(eq(schema.appointments.patientId, patientId))
  }
  const data = await readDataFile<any[]>('appointments.json')
  return data.filter((a: any) => a.patientId === patientId)
}

// Prescription helpers
export async function getPrescriptions() {
  const db = getDb()
  if (db) {
    return db.select().from(schema.prescriptions)
  }
  return readDataFile<any[]>('prescriptions.json')
}

export async function createPrescription(data: any) {
  const db = getDb()
  if (db) {
    const result = await db.insert(schema.prescriptions).values(data).returning()
    return result[0]
  }
  const prescriptions = await readDataFile<any[]>('prescriptions.json')
  prescriptions.push(data)
  await writeDataFile('prescriptions.json', prescriptions)
  return data
}

export async function getPatientPrescriptions(patientId: string) {
  const db = getDb()
  if (db) {
    return db.select().from(schema.prescriptions).where(eq(schema.prescriptions.patientId, patientId))
  }
  const data = await readDataFile<any[]>('prescriptions.json')
  return data.filter((r: any) => r.patientId === patientId)
}

// Inventory helpers
export async function getInventory() {
  const db = getDb()
  if (db) {
    return db.select().from(schema.inventory)
  }
  return readDataFile<any[]>('inventory.json')
}

export async function updateInventoryStock(name: string, stock: number) {
  const db = getDb()
  if (db) {
    await db.update(schema.inventory).set({ stock, updatedAt: new Date() }).where(eq(schema.inventory.name, name))
    return
  }
  const inventoryData = await readDataFile<any[]>('inventory.json')
  const idx = inventoryData.findIndex((i: any) => i.name.toLowerCase() === name.toLowerCase())
  if (idx >= 0) {
    inventoryData[idx].stock = stock
    await writeDataFile('inventory.json', inventoryData)
  }
}

// Invoice helpers
export async function getInvoices() {
  const db = getDb()
  if (db) {
    return db.select().from(schema.invoices)
  }
  return readDataFile<any[]>('invoices.json')
}

export async function createInvoice(data: any) {
  const db = getDb()
  if (db) {
    const result = await db.insert(schema.invoices).values(data).returning()
    return result[0]
  }
  const invoicesData = await readDataFile<any[]>('invoices.json')
  invoicesData.push(data)
  await writeDataFile('invoices.json', invoicesData)
  return data
}

// Inventory item update (all fields, not just stock)
// Returns the updated item, or null if not found
export async function updateInventoryItem(name: string, data: any) {
  const db = getDb()
  if (db) {
    // Check existence first
    const existing = await db.select().from(schema.inventory).where(eq(schema.inventory.name, name)).limit(1)
    if (!existing[0]) return null
    const result = await db.update(schema.inventory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.inventory.name, name))
      .returning()
    return result[0] || null
  }
  const inventoryData = await readDataFile<any[]>('inventory.json')
  const idx = inventoryData.findIndex((i: any) => i.name.toLowerCase() === name.toLowerCase())
  if (idx < 0) return null
  inventoryData[idx] = { ...inventoryData[idx], ...data }
  await writeDataFile('inventory.json', inventoryData)
  return inventoryData[idx]
}

// Settings helpers
export async function getSettings() {
  const db = getDb()
  if (db) {
    const result = await db.select().from(schema.hospitalSettings).limit(1)
    return result[0] || null
  }
  return readDataFile<Record<string, any>>('settings.json')
}

export async function updateSettings(data: any) {
  const db = getDb()
  if (db) {
    const existing = await getSettings()
    if (existing) {
      await db.update(schema.hospitalSettings).set({ ...data, updatedAt: new Date() }).where(eq(schema.hospitalSettings.id, existing.id))
    } else {
      await db.insert(schema.hospitalSettings).values(data)
    }
    return getSettings()
  }
  const existing = await readDataFile<Record<string, any>>('settings.json')
  const updated = { ...existing, ...data }
  await writeDataFile('settings.json', updated)
  return updated
}

// Audit log helpers
export async function createAuditLog(data: any) {
  const db = getDb()
  if (db) {
    const result = await db.insert(schema.auditLogs).values(data).returning()
    return result[0]
  }
  const logs = await readDataFile<any[]>('audit_logs.json')
  logs.push(data)
  await writeDataFile('audit_logs.json', logs)
  return data
}

export async function getAuditLogsFiltered(filters?: {
  userId?: string
  resourceType?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}) {
  const db = getDb()
  if (db) {
    const conditions: any[] = []
    if (filters?.userId) conditions.push(eq(schema.auditLogs.userId, filters.userId))
    if (filters?.resourceType) conditions.push(eq(schema.auditLogs.resourceType, filters.resourceType))
    if (filters?.from) conditions.push(gte(schema.auditLogs.timestamp, new Date(filters.from)))
    if (filters?.to) conditions.push(lte(schema.auditLogs.timestamp, new Date(filters.to)))

    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const offset = (page - 1) * limit

    const [logs, totalResult] = await Promise.all([
      db.select().from(schema.auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(schema.auditLogs.timestamp)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(schema.auditLogs),
    ])

    const total = Number(totalResult[0]?.count || 0)
    return { logs, total, page, totalPages: Math.ceil(total / limit) }
  }

  let logs = await readDataFile<any[]>('audit_logs.json')
  if (filters?.userId) logs = logs.filter((l: any) => l.userId === filters.userId)
  if (filters?.resourceType) logs = logs.filter((l: any) => l.resourceType === filters.resourceType)
  if (filters?.from) logs = logs.filter((l: any) => new Date(l.timestamp).getTime() >= new Date(filters.from!).getTime())
  if (filters?.to) logs = logs.filter((l: any) => new Date(l.timestamp).getTime() <= new Date(filters.to!).getTime())

  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const start = (page - 1) * limit
  const paginated = logs.slice(start, start + limit)

  return { logs: paginated, total: logs.length, page, totalPages: Math.ceil(logs.length / limit) }
}

// Auth helpers using DB
export async function updatePatientPassword(patientId: string, passwordHash: string) {
  const db = getDb()
  if (db) {
    await db.update(schema.patients).set({ passwordHash }).where(eq(schema.patients.patientId, patientId))
    return
  }
  const patientsData = await readDataFile<Record<string, any>>('patients.json')
  if (patientsData[patientId]) {
    patientsData[patientId].passwordHash = passwordHash
    await writeDataFile('patients.json', patientsData)
  }
}

export async function updateStaffPassword(staffId: string, passwordHash: string) {
  const db = getDb()
  if (db) {
    await db.update(schema.staff).set({ passwordHash }).where(eq(schema.staff.staffId, staffId))
    return
  }
  const staffData = await readDataFile<Record<string, any>>('staff.json')
  if (staffData[staffId]) {
    staffData[staffId].passwordHash = passwordHash
    await writeDataFile('staff.json', staffData)
  }
}
