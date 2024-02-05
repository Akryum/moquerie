import { type FSWatcher, watch } from 'chokidar'
import createJITI, { type JITI } from 'jiti'
import path from 'pathe'
import type { MoquerieInstance } from '../instance.js'

export class MockFileWatcher {
  watcher: FSWatcher

  private mq: MoquerieInstance
  private jiti: JITI

  private updateHandlers: Array<(file: string, data: any) => unknown> = []
  private removeHandlers: Array<(file: string) => unknown> = []

  constructor(mq: MoquerieInstance) {
    this.mq = mq

    const cwd = mq.data.cwd

    this.jiti = createJITI(cwd, {
      requireCache: false,
      esmResolve: true,
    })

    this.watcher = watch([
      '**/*.mock.js',
      '**/*.mock.ts',
    ], {
      cwd,
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
      for (const handler of this.removeHandlers) {
        handler(file)
      }
    })
  }

  waitForReady() {
    return new Promise<void>((resolve) => {
      this.watcher.on('ready', () => {
        resolve()
      })
    })
  }

  onUpdate(handler: (file: string, data: any) => unknown) {
    this.updateHandlers.push(handler)
  }

  onRemove(handler: (file: string) => unknown) {
    this.removeHandlers.push(handler)
  }

  destroy() {
    this.watcher.close()
  }

  private async upsertFieldActions(file: string) {
    try {
      const absoluteFile = path.join(this.mq.data.cwd, file)

      const mod = await this.jiti(absoluteFile)
      const defaultExport = mod.default ?? mod
      if (!defaultExport) {
        throw new Error(`Invalid field action file ${file} - missing default export`)
      }
      for (const handler of this.updateHandlers) {
        handler(file, defaultExport)
      }
    }
    catch (e) {
      console.warn(e)
    }
  }
}
