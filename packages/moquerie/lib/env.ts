import process from 'node:process'
import path from 'pathe'

export function getCwd() {
  return path.resolve(process.env.MOQUERIE_OVERRIDE_CWD ?? process.cwd())
}
