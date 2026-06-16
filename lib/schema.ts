import { pgTable, text, integer, boolean, decimal, jsonb, timestamp, serial, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core'

export const patients = pgTable('patients', {
  patientId: text('patient_id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  bloodType: text('blood_type'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const staff = pgTable('staff', {
  staffId: text('staff_id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  phone: text('phone'),
  department: text('department'),
  passwordHash: text('password_hash'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  invitedAt: text('invited_at'),
  acceptedAt: text('accepted_at'),
})

export const otps = pgTable('otps', {
  email: text('email').primaryKey(),
  code: text('code').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  patientId: text('patient_id'),
  patientName: text('patient_name'),
  doctor: text('doctor'),
  department: text('department'),
  date: text('date'),
  time: text('time'),
  room: text('room'),
  status: text('status').default('Scheduled'),
  type: text('type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey(),
  patientId: text('patient_id'),
  patientName: text('patient_name'),
  medication: text('medication'),
  dosage: text('dosage'),
  quantity: integer('quantity'),
  prescribedBy: text('prescribed_by'),
  date: text('date'),
  status: text('status').default('Pending'),
  expiryDate: text('expiry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  stock: integer('stock').default(0),
  minStock: integer('min_stock').default(0),
  unit: text('unit'),
  supplier: text('supplier'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  patientId: text('patient_id'),
  patientName: text('patient_name'),
  amount: text('amount'), // stored as string to handle Decimal precision
  services: text('services').array(),
  date: text('date'),
  dueDate: text('due_date'),
  status: text('status').default('Pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userRole: text('user_role'),
  action: text('action'),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

export const hospitalSettings = pgTable('hospital_settings', {
  id: serial('id').primaryKey(),
  hospitalName: text('hospital_name').default('MedCore Hospital'),
  email: text('email').default('admin@medcore.hospital'),
  phone: text('phone'),
  currency: text('currency').default('USD'),
  locale: text('locale').default('en-US'),
  timezone: text('timezone').default('UTC'),
  notifications: jsonb('notifications').default({ email: true, sms: true }),
  maintenanceMode: boolean('maintenance_mode').default(false),
  twoFactor: boolean('two_factor').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
