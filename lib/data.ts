import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// Files that are keyed objects (Record<string, T>) vs arrays
const OBJECT_FILES = new Set([
  'patients.json',
  'staff.json',
  'otps.json',
  'settings.json',
])

export async function readDataFile<T>(filename: string): Promise<T> {
  try {
    const filePath = path.join(DATA_DIR, filename)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    // Return appropriate default based on file type
    if (OBJECT_FILES.has(filename)) {
      return {} as T
    }
    return [] as T
  }
}

export async function writeDataFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
