import fs from 'node:fs'
import { pascalCase } from 'scule'

export async function ensureDir(folder: string) {
  if (!fs.existsSync(folder)) {
    await fs.promises.mkdir(folder, { recursive: true })
  }
}

export function getPrettyFilename(text: string) {
  return pascalCase(text.replace(/\W+/g, '_'))
}
