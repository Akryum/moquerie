import process from 'node:process'
import fs from 'node:fs'
import path from 'pathe'
import { LRUCache } from 'lru-cache'
import type { MoquerieInstance } from '../instance.js'
import { findUp } from './find-up.js'

export function getDefaultCwd() {
  return path.resolve(process.env.MOQUERIE_OVERRIDE_CWD ?? process.cwd())
}

const projectNameCache = new LRUCache<string, string>({
  max: 100,
  ttl: 5000,
})

export function getProjectName(mq: MoquerieInstance): string {
  const cwd = mq.data.cwd
  const cached = projectNameCache.get(cwd)
  if (cached) {
    return cached
  }
  const pkgFile = findUp(cwd, ['package.json'])
  if (pkgFile) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'))
      projectNameCache.set(cwd, pkg.name)
      return pkg.name
    }
    catch (e: any) {
      throw new Error(`[moquerie] Error parsing ${pkgFile}: ${e.message ?? e}`)
    }
  }
  throw new Error(`[moquerie] package.json not found looking from ${cwd}`)
}

const projectHasTypescriptCache = new LRUCache<string, boolean>({
  max: 100,
  ttl: 1000 * 60 * 5,
})

export function projectHasTypescript(mq: MoquerieInstance): boolean {
  const cwd = mq.data.cwd
  const cached = projectHasTypescriptCache.get(cwd)
  if (cached !== undefined) {
    return cached
  }
  const tsconfigFile = findUp(cwd, ['tsconfig.json'])
  projectHasTypescriptCache.set(cwd, !!tsconfigFile)
  return !!tsconfigFile
}
