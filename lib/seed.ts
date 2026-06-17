import { db } from './db'
import * as schema from './schema'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { addHours } from 'date-fns'

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

  // ── Staff ──
  const adminHash = await bcrypt.hash('Abdulsobur1.', 10)
  const doctorHash = await bcrypt.hash('Doctor123', 10)
  const staffHash = await bcrypt.hash('Staff123', 10)

  const [admin] = await db.insert(schema.staff).values({
    name: 'Dr. Abdulsobur',
    email: 'abdullahabdulsobur@gmail.com',
    passwordHash: adminHash,
    role: 'admin',
    department: 'Administration',
    phone: '+234-800-000-0001',
  }).returning()

  const [amina] = await db.insert(schema.staff).values({
    name: 'Dr. Amina Bello',
    email: 'amina.bello@medcore.ng',
    passwordHash: doctorHash,
    role: 'doctor',
    department: 'Cardiology',
    phone: '+234-800-000-0002',
  }).returning()

  const [fatima] = await db.insert(schema.staff).values({
    name: 'Fatima Yusuf',
    email: 'fatima.yusuf@medcore.ng',
    passwordHash: staffHash,
    role: 'receptionist',
    department: 'Front Desk',
    phone: '+234-800-000-0003',
  }).returning()

  const [chukwu] = await db.insert(schema.staff).values({
    name: 'Chukwu Eze',
    email: 'chukwu.eze@medcore.ng',
    passwordHash: staffHash,
    role: 'pharmacist',
    department: 'Pharmacy',
    phone: '+234-800-000-0004',
  }).returning()

  const [ngozi] = await db.insert(schema.staff).values({
    name: 'Ngozi Okafor',
    email: 'ngozi.okafor@medcore.ng',
    passwordHash: staffHash,
    role: 'accountant',
    department: 'Finance',
    phone: '+234-800-000-0005',
  }).returning()

  console.log('✅ Staff seeded (5)')

  // ── Patients ──
  const patientHash = await bcrypt.hash('Patient123', 10)

  const patientData = [
    { firstName: 'Chidi', lastName: 'Okonkwo', email: 'chidi.okonkwo@email.com', phone: '+234-801-000-0001', dob: '1985-03-12', gender: 'Male', bloodType: 'O+', status: 'admitted' as const, ward: 'Ward A', assignedDoctorId: amina.id },
    { firstName: 'Zainab', lastName: 'Abdullahi', email: 'zainab.abdullahi@email.com', phone: '+234-801-000-0002', dob: '1990-07-22', gender: 'Female', bloodType: 'A+', status: 'outpatient' as const, ward: null, assignedDoctorId: amina.id },
    { firstName: 'Emeka', lastName: 'Okafor', email: 'emeka.okafor@email.com', phone: '+234-801-000-0003', dob: '1978-11-05', gender: 'Male', bloodType: 'B+', status: 'admitted' as const, ward: 'Ward B', assignedDoctorId: amina.id },
    { firstName: 'Aisha', lastName: 'Mohammed', email: 'aisha.mohammed@email.com', phone: '+234-801-000-0004', dob: '1995-01-18', gender: 'Female', bloodType: 'AB+', status: 'outpatient' as const, ward: null, assignedDoctorId: null },
    { firstName: 'Oluwaseun', lastName: 'Adebayo', email: 'oluwaseun.adebayo@email.com', phone: '+234-801-000-0005', dob: '1982-09-30', gender: 'Male', bloodType: 'O-', status: 'critical' as const, ward: 'ICU', assignedDoctorId: amina.id },
    { firstName: 'Nneka', lastName: 'Eze', email: 'nneka.eze@email.com', phone: '+234-801-000-0006', dob: '2000-06-14', gender: 'Female', bloodType: 'A-', status: 'outpatient' as const, ward: null, assignedDoctorId: null },
    { firstName: 'Tunde', lastName: 'Balogun', email: 'tunde.balogun@email.com', phone: '+234-801-000-0007', dob: '1975-12-01', gender: 'Male', bloodType: 'B-', status: 'discharged' as const, ward: null, assignedDoctorId: null },
    { firstName: 'Grace', lastName: 'John', email: 'grace.john@email.com', phone: '+234-801-000-0008', dob: '1998-04-25', gender: 'Female', bloodType: 'O+', status: 'admitted' as const, ward: 'Ward A', assignedDoctorId: amina.id },
  ]

  const patients = []
  for (let i = 0; i < patientData.length; i++) {
    const data = patientData[i]
    const [patient] = await db.insert(schema.patients).values({
      ...data,
      patientCode: `PT-${String(i + 1).padStart(4, '0')}`,
      passwordHash: patientHash,
      address: `${i + 1} Medical Street, Lagos`,
      emergencyContact: `+234-802-000-${String(i + 1).padStart(4, '0')}`,
      insurance: 'HealthPlus HMO',
    }).returning()
    patients.push(patient)
  }

  console.log('✅ Patients seeded (8)')

  // ── Appointments ──
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(dayAfter.getDate() + 2)

  const appointmentData = [
    { patientId: patients[0].id, doctorId: amina.id, type: 'Cardiology Checkup', department: 'Cardiology', scheduledAt: new Date(today.getTime() + 9 * 3600000), status: 'confirmed' as const },
    { patientId: patients[1].id, doctorId: amina.id, type: 'Follow-up', department: 'Cardiology', scheduledAt: new Date(today.getTime() + 10 * 3600000), status: 'confirmed' as const },
    { patientId: patients[2].id, doctorId: amina.id, type: 'Routine Check', department: 'Cardiology', scheduledAt: new Date(today.getTime() + 11 * 3600000), status: 'pending' as const },
    { patientId: patients[3].id, doctorId: amina.id, type: 'Consultation', department: 'Cardiology', scheduledAt: new Date(today.getTime() + 14 * 3600000), status: 'urgent' as const },
    { patientId: patients[4].id, doctorId: amina.id, type: 'ICU Review', department: 'ICU', scheduledAt: new Date(today.getTime() + 15 * 3600000), status: 'confirmed' as const },
    { patientId: patients[5].id, doctorId: amina.id, type: 'General Checkup', department: 'General', scheduledAt: new Date(tomorrow.getTime() + 9 * 3600000), status: 'pending' as const },
    { patientId: patients[6].id, doctorId: amina.id, type: 'Discharge Follow-up', department: 'General', scheduledAt: new Date(tomorrow.getTime() + 10 * 3600000), status: 'confirmed' as const },
    { patientId: patients[0].id, doctorId: amina.id, type: 'Blood Pressure Check', department: 'Cardiology', scheduledAt: new Date(tomorrow.getTime() + 11 * 3600000), status: 'pending' as const },
    { patientId: patients[2].id, doctorId: amina.id, type: 'Medication Review', department: 'Cardiology', scheduledAt: new Date(tomorrow.getTime() + 14 * 3600000), status: 'cancelled' as const },
    { patientId: patients[7].id, doctorId: amina.id, type: 'Admission Check', department: 'Cardiology', scheduledAt: new Date(dayAfter.getTime() + 9 * 3600000), status: 'confirmed' as const },
    { patientId: patients[1].id, doctorId: amina.id, type: 'ECG Test', department: 'Cardiology', scheduledAt: new Date(dayAfter.getTime() + 10 * 3600000), status: 'pending' as const },
    { patientId: patients[3].id, doctorId: amina.id, type: 'Lab Results Review', department: 'Cardiology', scheduledAt: new Date(dayAfter.getTime() + 11 * 3600000), status: 'urgent' as const },
  ]

  for (const apt of appointmentData) {
    await db.insert(schema.appointments).values(apt)
  }

  console.log('✅ Appointments seeded (12)')

  // ── Prescriptions ──
  const prescData = [
    { patientId: patients[0].id, doctorId: amina.id, diagnosis: 'Hypertension', notes: 'Patient BP elevated. Prescribing antihypertensives.', status: 'pending' as const, drugs: [
      { drugName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
      { drugName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
    ]},
    { patientId: patients[1].id, doctorId: amina.id, diagnosis: 'Type 2 Diabetes', notes: 'Blood sugar levels elevated. Dietary changes recommended.', status: 'pending' as const, drugs: [
      { drugName: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days' },
    ]},
    { patientId: patients[2].id, doctorId: amina.id, diagnosis: 'Chest Pain - Angina', notes: 'Stress test scheduled. Prescribing nitroglycerin.', status: 'dispensed' as const, drugs: [
      { drugName: 'Nitroglycerin', dosage: '0.4mg', frequency: 'As needed', duration: '30 days' },
      { drugName: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '90 days' },
    ]},
    { patientId: patients[4].id, doctorId: amina.id, diagnosis: 'Respiratory Infection', notes: 'Patient in ICU. IV antibiotics started.', status: 'dispensed' as const, drugs: [
      { drugName: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
      { drugName: 'Ibuprofen', dosage: '400mg', frequency: 'As needed for fever', duration: '5 days' },
    ]},
    { patientId: patients[5].id, doctorId: amina.id, diagnosis: 'Migraine', notes: 'Patient reports chronic migraines.', status: 'pending' as const, drugs: [
      { drugName: 'Sumatriptan', dosage: '50mg', frequency: 'As needed for migraine', duration: '10 days' },
    ]},
    { patientId: patients[7].id, doctorId: amina.id, diagnosis: 'Malaria', notes: 'Positive for Plasmodium. Started antimalarials.', status: 'dispensed' as const, drugs: [
      { drugName: 'Artemether-Lumefantrine', dosage: '80mg/480mg', frequency: 'Twice daily', duration: '3 days' },
      { drugName: 'Paracetamol', dosage: '500mg', frequency: 'As needed for fever', duration: '3 days' },
    ]},
  ]

  for (const pData of prescData) {
    const { drugs: drugList, ...prescFields } = pData
    const [prescription] = await db.insert(schema.prescriptions).values(prescFields).returning()
    for (const drug of drugList) {
      await db.insert(schema.prescriptionDrugs).values({
        ...drug,
        prescriptionId: prescription.id,
      })
    }
  }

  console.log('✅ Prescriptions seeded (6)')

  // ── Drugs ──
  const drugData = [
    { name: 'Lisinopril', quantity: 200, unit: 'tablets', reorderLevel: 50 },
    { name: 'Metformin', quantity: 350, unit: 'tablets', reorderLevel: 100 },
    { name: 'Amoxicillin', quantity: 30, unit: 'capsules', reorderLevel: 100 },
    { name: 'Ibuprofen', quantity: 500, unit: 'tablets', reorderLevel: 100 },
    { name: 'Paracetamol', quantity: 800, unit: 'tablets', reorderLevel: 200 },
    { name: 'Atorvastatin', quantity: 20, unit: 'tablets', reorderLevel: 50 },
    { name: 'Omeprazole', quantity: 150, unit: 'capsules', reorderLevel: 50 },
    { name: 'Salbutamol Inhaler', quantity: 10, unit: 'inhalers', reorderLevel: 30 },
    { name: 'Insulin Glargine', quantity: 5, unit: 'vials', reorderLevel: 20 },
    { name: 'Artemether-Lumefantrine', quantity: 60, unit: 'tablets', reorderLevel: 40 },
  ]

  for (const drug of drugData) {
    await db.insert(schema.drugs).values(drug)
  }

  console.log('✅ Drugs seeded (10)')

  // ── Invoices ──
  const invoiceData = [
    { invoiceCode: 'INV-2024-001', patientId: patients[0].id, service: 'Cardiology Consultation + ECG', amount: 25000, status: 'paid' as const, paymentMethod: 'Insurance' },
    { invoiceCode: 'INV-2024-002', patientId: patients[1].id, service: 'Diabetes Management - Lab Tests', amount: 15000, status: 'paid' as const, paymentMethod: 'Cash' },
    { invoiceCode: 'INV-2024-003', patientId: patients[2].id, service: 'Cardiac Stress Test', amount: 45000, status: 'pending' as const, paymentMethod: null },
    { invoiceCode: 'INV-2024-004', patientId: patients[3].id, service: 'General Consultation + Lab Work', amount: 12000, status: 'overdue' as const, paymentMethod: null },
    { invoiceCode: 'INV-2024-005', patientId: patients[4].id, service: 'ICU Admission - Day 1-3', amount: 150000, status: 'processing' as const, paymentMethod: 'Insurance' },
    { invoiceCode: 'INV-2024-006', patientId: patients[5].id, service: 'Consultation + Prescription', amount: 8000, status: 'paid' as const, paymentMethod: 'Cash' },
    { invoiceCode: 'INV-2024-007', patientId: patients[6].id, service: 'Discharge Summary + Follow-up', amount: 5500, status: 'paid' as const, paymentMethod: 'Card' },
    { invoiceCode: 'INV-2024-008', patientId: patients[7].id, service: 'Admission Fee - Ward A', amount: 35000, status: 'pending' as const, paymentMethod: null },
  ]

  for (const inv of invoiceData) {
    await db.insert(schema.invoices).values(inv)
  }

  console.log('✅ Invoices seeded (8)')
  console.log('')
  console.log('🎉 MedCore HMS seeding complete!')
  console.log('')
  console.log('📋 Test Credentials:')
  console.log('   Super Admin: abdullahabdulsobur@gmail.com / Abdulsobur1.')
  console.log('   Dr. Amina:   amina.bello@medcore.ng / Doctor123')
  console.log('   Reception:   fatima.yusuf@medcore.ng / Staff123')
  console.log('   Pharmacist:  chukwu.eze@medcore.ng / Staff123')
  console.log('   Accountant:  ngozi.okafor@medcore.ng / Staff123')
  console.log('   Patients:    All passwords are "Patient123"')
}

main().catch(console.error)
