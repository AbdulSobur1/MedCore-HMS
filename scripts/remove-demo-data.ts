import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

function loadEnvLocal() {
  const envPath = path.resolve('.env.local')
  if (!fs.existsSync(envPath)) return

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const index = trimmed.indexOf('=')
    if (index === -1) continue

    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && value && !process.env[key]) process.env[key] = value
  }
}

function quote(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

async function main() {
  loadEnvLocal()

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local or the shell environment.')
  }

  const apply = process.argv.includes('--apply')
  const sql = neon(databaseUrl)

  const demoPatients = await sql.query(`
    select id, patient_code, first_name, last_name, email
    from patients
    where patient_code in ('PT-0001', 'PT-0002', 'PT-0003', 'PT-0004', 'PT-0005')
       or lower(email) in (
         'chidi.okonkwo@email.com',
         'zainab.abdullahi@email.com',
         'emeka.okafor@email.com',
         'aisha.mohammed@email.com',
         'oluwaseun.adebayo@email.com'
       )
       or (
         lower(first_name || ' ' || last_name) in (
           'chidi okonkwo',
           'zainab abdullahi',
           'emeka okafor',
           'aisha mohammed',
           'oluwaseun adebayo'
         )
       )
  `)

  const ids = demoPatients.map((patient: any) => patient.id as string)

  if (ids.length === 0) {
    console.log('No known demo patients found.')
    return
  }

  console.log(`Found ${ids.length} known demo patient(s):`)
  for (const patient of demoPatients as any[]) {
    console.log(`- ${patient.patient_code}: ${patient.first_name} ${patient.last_name} <${patient.email}>`)
  }

  if (!apply) {
    console.log('')
    console.log('Dry run only. Re-run with --apply to delete these demo records and their related appointments, invoices, and prescriptions.')
    return
  }

  const idList = ids.map(quote).join(', ')

  const demoPrescriptions = await sql.query(`
    select id from prescriptions where patient_id in (${idList})
  `)
  const prescriptionIds = demoPrescriptions.map((rx: any) => rx.id as string)

  if (prescriptionIds.length > 0) {
    const rxList = prescriptionIds.map(quote).join(', ')
    await sql.query(`delete from prescription_drugs where prescription_id in (${rxList})`)
  }

  await sql.query(`delete from prescriptions where patient_id in (${idList})`)
  await sql.query(`delete from appointments where patient_id in (${idList})`)
  await sql.query(`delete from invoices where patient_id in (${idList})`)
  await sql.query(`delete from patients where id in (${idList})`)

  console.log('Deleted known demo patients and related records.')
}

main().catch((error) => {
  console.error('Failed to remove demo data:', error)
  process.exit(1)
})
