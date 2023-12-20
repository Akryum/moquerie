import { loadConfig } from 'c12'
import type { Config } from '../types/config.js'
import { getCwd } from '../util/env.js'

export async function resolveConfig() {
  return loadConfig<Config>({
    name: 'moquerie',
    cwd: getCwd(),
  })
}
