import { type FSWatcher, watch } from 'chokidar'
import createJITI, { type JITI } from 'jiti'
import path from 'pathe'
import { getCwd } from '../util/env.js'
import type { FieldAction } from '../types/fieldAction.js'
import type { ResourceSchema } from '../types/resource.js'

export interface FieldActionWatcherConfig {
  getSchema: () => ResourceSchema
}

export class FieldActionWatcher {
  watcher: FSWatcher
  allActions: FieldAction[] = []

  private config: FieldActionWatcherConfig
  private jiti: JITI

  constructor(config: FieldActionWatcherConfig) {
    this.config = config

    this.jiti = createJITI(getCwd(), {
      requireCache: false,
      esmResolve: true,
    })

    this.watcher = watch([
      '**/*.mock.js',
      '**/*.mock.ts',
    ], {
      cwd: getCwd(),
      ignored: [
        '**/node_modules/**',
      ],
    })

    this.watcher.on('add', (file) => {
      this.upsertFieldActions(file)
    })

    this.watcher.on('change', (file) => {
      this.upsertFieldActions(file)
    })

    this.watcher.on('unlink', (file) => {
      this.removeFieldActions(file)
    })
  }

  async upsertFieldActions(file: string) {
    try {
      const absoluteFile = path.join(getCwd(), file)

      // Cleanup
      this.allActions = this.allActions.filter(action => action.file !== file)

      const mod = await this.jiti(absoluteFile)
      const defaultExport = mod.default ?? mod
      if (!defaultExport) {
        throw new Error(`Invalid field action file ${file} - missing default export`)
      }
      if (defaultExport.__fieldActions) {
        const actionsMap = defaultExport.__fieldActions
        for (const resourceName in actionsMap) {
          const actions = actionsMap[resourceName]
          for (const fieldName in actions) {
            const existingIndex = this.allActions.findIndex(action => action.resourceName === resourceName && action.fieldName === fieldName)
            if (existingIndex !== -1) {
              this.allActions.splice(existingIndex, 1)
            }

            const action = actions[fieldName]
            this.allActions.push({
              resourceName,
              fieldName,
              action,
              file,
            })
          }
        }
      }
    }
    catch (e) {
      console.warn(e)
    }
  }

  removeFieldActions(file: string) {
    this.allActions = this.allActions.filter(action => action.file !== file)
  }

  destroy() {
    this.watcher.close()
    this.allActions.length = 0
  }
}

export async function createFieldActionWatcher(config: FieldActionWatcherConfig) {
  const watcher = new FieldActionWatcher(config)
  return new Promise<FieldActionWatcher>((resolve) => {
    watcher.watcher.on('ready', () => {
      resolve(watcher)
    })
  })
}
