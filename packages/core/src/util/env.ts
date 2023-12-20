import process from 'node:process'
import fs from 'node:fs'
import path from 'pathe'
import { findUp } from './find-up.js'

export function getCwd() {
  return path.resolve(process.env.MOQUERIE_OVERRIDE_CWD ?? process.cwd())
}

export function getProjectName(): string {
  const cwd = getCwd()
  const pkgFile = findUp(cwd, ['package.json'])
  if (pkgFile) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'))
      return pkg.name
    }
    catch (e: any) {
      throw new Error(`[moquerie] Error parsing ${pkgFile}: ${e.message ?? e}`)
    }
  }
  throw new Error(`[moquerie] package.json not found looking from ${cwd}`)
}
