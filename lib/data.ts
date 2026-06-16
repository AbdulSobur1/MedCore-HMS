import { sql, eq, and, gte, lte } from 'drizzle-orm'
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
// -------------------------------------------------------

let dbInitialized = false
let dbModule: any = null
let schemaModule: any = null

async function ensureDb() {
  if (dbInitialized && dbModule) return true
  if (!process.env.DATABASE_URL) return false

  try {
    const { neon } = await import('@neondatabase/serverless')
    const { drizzle } = await import('drizzle-orm/neon-http')
    const schema = await import('./schema')
    const sql = neon(process.env.DATABASE_URL)
    dbModule = drizzle({ client: sql, schema })
    schemaModule = schema
    dbInitialized = true
    return true
  } catch {
    return false
  }
}

export { eq, and, gte, lte }

// Re-export all tables
export async function getTables() {
  if (await ensureDb()) return schemaModule
  return null
}

// Patient helpers
export async function getAllPatients() {
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.patients)
  }
  const data = await readDataFile<Record<string, any>>('patients.json')
  return Object.values(data)
}

export async function getPatientById(patientId: string) {
  if (await ensureDb()) {
    const result = await dbModule.select().from(schemaModule.patients).where(eq(schemaModule.patients.patientId, patientId)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('patients.json')
  return data[patientId] || null
}

export async function getPatientByEmail(email: string) {
  if (await ensureDb()) {
    const result = await dbModule.select().from(schemaModule.patients).where(eq(schemaModule.patients.email, email)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('patients.json')
  return Object.values(data).find((p: any) => p.email === email) || null
}

export async function createPatient(data: any) {
  if (await ensureDb()) {
    const result = await dbModule.insert(schemaModule.patients).values(data).returning()
    return result[0]
  }
  const patients = await readDataFile<Record<string, any>>('patients.json')
  patients[data.patientId] = data
  await writeDataFile('patients.json', patients)
  return data
}

// Staff helpers
export async function getAllStaff() {
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.staff)
  }
  const data = await readDataFile<Record<string, any>>('staff.json')
  return Object.values(data)
}

export async function getStaffByEmail(email: string) {
  if (await ensureDb()) {
    const result = await dbModule.select().from(schemaModule.staff).where(eq(schemaModule.staff.email, email)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('staff.json')
  return Object.values(data).find((s: any) => s.email === email) || null
}

export async function getDoctors() {
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.staff).where(eq(schemaModule.staff.role, 'doctor'))
  }
  const data = await readDataFile<Record<string, any>>('staff.json')
  return Object.values(data).filter((s: any) => s.role === 'doctor')
}

export async function createStaff(data: any) {
  if (await ensureDb()) {
    const result = await dbModule.insert(schemaModule.staff).values(data).returning()
    return result[0]
  }
  const staffProfiles = await readDataFile<Record<string, any>>('staff.json')
  staffProfiles[data.staffId] = data
  await writeDataFile('staff.json', staffProfiles)
  return data
}

// OTP helpers
export async function getOTP(email: string) {
  if (await ensureDb()) {
    const result = await dbModule.select().from(schemaModule.otps).where(eq(schemaModule.otps.email, email)).limit(1)
    return result[0] || null
  }
  const data = await readDataFile<Record<string, any>>('otps.json')
  return data[email] || null
}

export async function setOTP(email: string, code: string, expiresAt: string) {
  if (await ensureDb()) {
    await dbModule.insert(schemaModule.otps).values({ email, code, expiresAt }).onConflictDoUpdate({
      target: schemaModule.otps.email,
      set: { code, expiresAt },
    })
    return
  }
  const data = await readDataFile<Record<string, any>>('otps.json')
  data[email] = { code, expiresAt }
  await writeDataFile('otps.json', data)
}

export async function deleteOTP(email: string) {
  if (await ensureDb()) {
    await dbModule.delete(schemaModule.otps).where(eq(schemaModule.otps.email, email))
    return
  }
  const data = await readDataFile<Record<string, any>>('otps.json')
  delete data[email]
  await writeDataFile('otps.json', data)
}

// Appointment helpers
export async function getAppointments(dateFilter?: string) {
  if (await ensureDb()) {
    if (dateFilter) {
      return dbModule.select().from(schemaModule.appointments).where(eq(schemaModule.appointments.date, dateFilter))
    }
    return dbModule.select().from(schemaModule.appointments)
  }
  const data = await readDataFile<any[]>('appointments.json')
  if (dateFilter) return data.filter((a: any) => a.date === dateFilter)
  return data
}

export async function createAppointment(data: any) {
  if (await ensureDb()) {
    const result = await dbModule.insert(schemaModule.appointments).values(data).returning()
    return result[0]
  }
  const appointments = await readDataFile<any[]>('appointments.json')
  appointments.push(data)
  await writeDataFile('appointments.json', appointments)
  return data
}

export async function getPatientAppointments(patientId: string) {
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.appointments).where(eq(schemaModule.appointments.patientId, patientId))
  }
  const data = await readDataFile<any[]>('appointments.json')
  return data.filter((a: any) => a.patientId === patientId)
}

// Prescription helpers
export async function getPrescriptions() {
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.prescriptions)
  }
  return readDataFile<any[]>('prescriptions.json')
}

export async function createPrescription(data: any) {
  if (await ensureDb()) {
    const result = await dbModule.insert(schemaModule.prescriptions).values(data).returning()
    return result[0]
  }
  const prescriptions = await readDataFile<any[]>('prescriptions.json')
  prescriptions.push(data)
  await writeDataFile('prescriptions.json', prescriptions)
  return data
}

export async function getPatientPrescriptions(patientId: string) {
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.prescriptions).where(eq(schemaModule.prescriptions.patientId, patientId))
  }
  const data = await readDataFile<any[]>('prescriptions.json')
  return data.filter((r: any) => r.patientId === patientId)
}

// Inventory helpers
export async function getInventory() {
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.inventory)
  }
  return readDataFile<any[]>('inventory.json')
}

export async function updateInventoryStock(name: string, stock: number) {
  if (await ensureDb()) {
    await dbModule.update(schemaModule.inventory).set({ stock, updatedAt: new Date() }).where(eq(schemaModule.inventory.name, name))
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
  if (await ensureDb()) {
    return dbModule.select().from(schemaModule.invoices)
  }
  return readDataFile<any[]>('invoices.json')
}

export async function createInvoice(data: any) {
  if (await ensureDb()) {
    const result = await dbModule.insert(schemaModule.invoices).values(data).returning()
    return result[0]
  }
  const invoicesData = await readDataFile<any[]>('invoices.json')
  invoicesData.push(data)
  await writeDataFile('invoices.json', invoicesData)
  return data
}

// Settings helpers
export async function getSettings() {
  if (await ensureDb()) {
    const result = await dbModule.select().from(schemaModule.hospitalSettings).limit(1)
    return result[0] || null
  }
  return readDataFile<Record<string, any>>('settings.json')
}

export async function updateSettings(data: any) {
  if (await ensureDb()) {
    const existing = await getSettings()
    if (existing) {
      await dbModule.update(schemaModule.hospitalSettings).set({ ...data, updatedAt: new Date() }).where(eq(schemaModule.hospitalSettings.id, existing.id))
    } else {
      await dbModule.insert(schemaModule.hospitalSettings).values(data)
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
  if (await ensureDb()) {
    const result = await dbModule.insert(schemaModule.auditLogs).values(data).returning()
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
  if (await ensureDb()) {
    const conditions: any[] = []
    if (filters?.userId) conditions.push(eq(schemaModule.auditLogs.userId, filters.userId))
    if (filters?.resourceType) conditions.push(eq(schemaModule.auditLogs.resourceType, filters.resourceType))
    if (filters?.from) conditions.push(gte(schemaModule.auditLogs.timestamp, new Date(filters.from)))
    if (filters?.to) conditions.push(lte(schemaModule.auditLogs.timestamp, new Date(filters.to)))

    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const offset = (page - 1) * limit

    const [logs, totalResult] = await Promise.all([
      dbModule.select().from(schemaModule.auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(schemaModule.auditLogs.timestamp)
        .limit(limit)
        .offset(offset),
      dbModule.select({ count: sql<number>`count(*)` }).from(schemaModule.auditLogs),
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
  if (await ensureDb()) {
    await dbModule.update(schemaModule.patients).set({ passwordHash }).where(eq(schemaModule.patients.patientId, patientId))
    return
  }
  const patientsData = await readDataFile<Record<string, any>>('patients.json')
  if (patientsData[patientId]) {
    patientsData[patientId].passwordHash = passwordHash
    await writeDataFile('patients.json', patientsData)
  }
}

export async function updateStaffPassword(staffId: string, passwordHash: string) {
  if (await ensureDb()) {
    await dbModule.update(schemaModule.staff).set({ passwordHash }).where(eq(schemaModule.staff.staffId, staffId))
    return
  }
  const staffData = await readDataFile<Record<string, any>>('staff.json')
  if (staffData[staffId]) {
    staffData[staffId].passwordHash = passwordHash
    await writeDataFile('staff.json', staffData)
  }
}
