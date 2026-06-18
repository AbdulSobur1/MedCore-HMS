import { randomUUID } from 'crypto'

function compactDate() {
  return new Date().toISOString().slice(0, 10).replaceAll('-', '')
}

function randomToken(length = 6) {
  return randomUUID().replaceAll('-', '').slice(0, length).toUpperCase()
}

export function createPatientCode() {
  return `PT-${compactDate()}-${randomToken(4)}`
}

export function createInvoiceCode() {
  return `INV-${new Date().getFullYear()}-${randomToken(6)}`
}
