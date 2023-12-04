import type { Config } from '../types/config.js'
import { resolveConfig } from './config.js'

export interface Context {
  config: Config
}

export async function createContext(): Promise<Context> {
  const { config } = await resolveConfig()
  if (!config) {
    throw new Error('[moquerie] config is not resolved, could not create context')
  }
  return {
    config,
  }
}
