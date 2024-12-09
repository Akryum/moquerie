import type { Config } from '../types/config.js'
import fs from 'node:fs'
import { loadConfig } from 'c12'
import path from 'pathe'

export async function resolveConfig(cwd: string) {
  // Auto Rest API Types
  const autoRestTypesFile = path.resolve(cwd, 'moquerie.rest.ts')
  const autoRestTypesEnabled = fs.existsSync(autoRestTypesFile)

  return loadConfig<Config>({
    name: 'moquerie',
    cwd,
    defaults: {
      ignoredResourcesInExplorer: [
        'Mutation',
        'Subscription',
      ],
      mockFiles: [
        '**/*.moq.js',
        '**/*.moq.ts',
        '**/*.mock.js',
        '**/*.mock.ts',
      ],
      ...autoRestTypesEnabled
        ? {
            rest: {
              typeFiles: [autoRestTypesFile],
            },
          }
        : {},
    },
  })
}
