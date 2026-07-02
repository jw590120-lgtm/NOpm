import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve('data')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function filePath(name: string): string {
  ensureDataDir()
  return path.join(DATA_DIR, `${name}.json`)
}

export function readCollection<T>(name: string): T[] {
  const fp = filePath(name)
  if (!fs.existsSync(fp)) return []
  try {
    const raw = fs.readFileSync(fp, 'utf-8')
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

export function writeCollection<T>(name: string, data: T[]): void {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf-8')
}

export function seedIfEmpty<T>(name: string, seed: T[]): T[] {
  const existing = readCollection<T>(name)
  if (existing.length === 0) {
    writeCollection(name, seed)
    return seed
  }
  return existing
}
