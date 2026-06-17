import {
  pgTable, text, timestamp, boolean,
  integer, pgEnum, uuid
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', [
  'admin', 'doctor', 'receptionist', 'pharmacist', 'accountant'
])
export const statusEnum = pgEnum('patient_status', [
  'admitted', 'outpatient', 'critical', 'discharged'
])
export const apptStatusEnum = pgEnum('appointment_status', [
  'confirmed', 'pending', 'cancelled', 'urgent'
])
export const prescStatusEnum = pgEnum('prescription_status', [
  'pending', 'dispensed'
])
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'paid', 'pending', 'overdue', 'processing'
])

// Staff — doctors, receptionists, pharmacists, accountants, admin
export const staff = pgTable('staff', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         text('name').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role:         roleEnum('role').notNull(),
  department:   text('department'),
  phone:        text('phone'),
  isActive:     boolean('is_active').notNull().default(true),
  lastLogin:    timestamp('last_login'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
})

// Staff invites — sent by admin, consumed once by invited staff
export const staffInvites = pgTable('staff_invites', {
  id:        uuid('id').primaryKey().defaultRandom(),
  email:     text('email').notNull(),
  role:      roleEnum('role').notNull(),
  department:text('department'),
  token:     text('token').notNull().unique(),
  usedAt:    timestamp('used_at'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Patients — self-registered
export const patients = pgTable('patients', {
  id:               uuid('id').primaryKey().defaultRandom(),
  patientCode:      text('patient_code').notNull().unique(),
  firstName:        text('first_name').notNull(),
  lastName:         text('last_name').notNull(),
  email:            text('email').notNull().unique(),
  passwordHash:     text('password_hash').notNull(),
  phone:            text('phone').notNull(),
  dob:              text('dob').notNull(),
  gender:           text('gender').notNull(),
  bloodType:        text('blood_type'),
  address:          text('address'),
  emergencyContact: text('emergency_contact'),
  insurance:        text('insurance'),
  status:           statusEnum('status').notNull().default('outpatient'),
  ward:             text('ward'),
  assignedDoctorId: uuid('assigned_doctor_id').references(() => staff.id),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
})

export const appointments = pgTable('appointments', {
  id:          uuid('id').primaryKey().defaultRandom(),
  patientId:   uuid('patient_id').notNull().references(() => patients.id),
  doctorId:    uuid('doctor_id').notNull().references(() => staff.id),
  type:        text('type').notNull(),
  department:  text('department'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status:      apptStatusEnum('status').notNull().default('pending'),
  notes:       text('notes'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

export const prescriptions = pgTable('prescriptions', {
  id:        uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  doctorId:  uuid('doctor_id').notNull().references(() => staff.id),
  diagnosis: text('diagnosis').notNull(),
  notes:     text('notes'),
  status:    prescStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const prescriptionDrugs = pgTable('prescription_drugs', {
  id:             uuid('id').primaryKey().defaultRandom(),
  prescriptionId: uuid('prescription_id').notNull()
                    .references(() => prescriptions.id),
  drugName:  text('drug_name').notNull(),
  dosage:    text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  duration:  text('duration').notNull(),
})

export const drugs = pgTable('drugs', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         text('name').notNull(),
  quantity:     integer('quantity').notNull().default(0),
  unit:         text('unit').notNull().default('units'),
  reorderLevel: integer('reorder_level').notNull().default(50),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

export const invoices = pgTable('invoices', {
  id:            uuid('id').primaryKey().defaultRandom(),
  invoiceCode:   text('invoice_code').notNull().unique(),
  patientId:     uuid('patient_id').notNull().references(() => patients.id),
  service:       text('service').notNull(),
  amount:        integer('amount').notNull(),
  paymentMethod: text('payment_method'),
  status:        invoiceStatusEnum('status').notNull().default('pending'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
})
