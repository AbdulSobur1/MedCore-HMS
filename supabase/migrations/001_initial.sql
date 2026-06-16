-- MedCore HMS - Initial PostgreSQL Schema
-- Run: npx drizzle-kit migrate

CREATE TABLE IF NOT EXISTS patients (
  patient_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT,
  blood_type TEXT,
  address TEXT,
  emergency_contact TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  staff_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  invited_at TEXT,
  accepted_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS otps (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  doctor TEXT,
  department TEXT,
  date TEXT,
  time TEXT,
  room TEXT,
  status TEXT DEFAULT 'Scheduled',
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  medication TEXT,
  dosage TEXT,
  quantity INTEGER,
  prescribed_by TEXT,
  date TEXT,
  status TEXT DEFAULT 'Pending',
  expiry_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit TEXT,
  supplier TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  amount TEXT,
  services TEXT[],
  date TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_role TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS hospital_settings (
  id SERIAL PRIMARY KEY,
  hospital_name TEXT DEFAULT 'MedCore Hospital',
  email TEXT DEFAULT 'admin@medcore.hospital',
  phone TEXT,
  currency TEXT DEFAULT 'USD',
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  notifications JSONB DEFAULT '{"email": true, "sms": true}',
  maintenance_mode BOOLEAN DEFAULT false,
  two_factor BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed default hospital settings
INSERT INTO hospital_settings (hospital_name, email, phone)
VALUES ('MedCore Hospital', 'admin@medcore.hospital', '(555) 123-4567')
ON CONFLICT DO NOTHING;

-- Seed inventory
INSERT INTO inventory (name, stock, min_stock, unit, supplier) VALUES
  ('Lisinopril 10mg', 450, 100, 'tablets', 'PharmaCorp'),
  ('Metformin 500mg', 320, 150, 'tablets', 'HealthMeds'),
  ('Digoxin 0.25mg', 45, 50, 'tablets', 'CardioMeds'),
  ('Amoxicillin 500mg', 890, 200, 'tablets', 'BioPharma'),
  ('Aspirin 100mg', 25, 100, 'tablets', 'GenericDrugs')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
