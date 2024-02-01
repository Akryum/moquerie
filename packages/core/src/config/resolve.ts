import { loadConfig } from 'c12'
import type { Config } from '../types/config.js'

export async function resolveConfig(cwd: string) {
  return loadConfig<Config>({
    name: 'moquerie',
    cwd,
    defaults: {
      ignoredResourcesInExplorer: [
        'Mutation',
        'Subscription',
      ],
    },
  })
}
