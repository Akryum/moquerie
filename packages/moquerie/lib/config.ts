import { loadConfig } from 'c12'
import type { Config } from '../types/config.js'
import { getCwd } from './env.js'

export function defineConfig(config: Config): Config {
  return config
}

export async function resolveConfig() {
  return loadConfig<Config>({
    name: 'moquerie',
    cwd: getCwd(),
  })
}
