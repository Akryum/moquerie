import type { MoquerieInstance } from '../instance.js'
import { type FSWatcher, watch } from 'chokidar'
import createJITI, { type JITI } from 'jiti'
import path from 'pathe'

export class MockFileWatcher {
  watcher: FSWatcher | undefined

  private mq: MoquerieInstance
  private jiti: JITI

  private updateHandlers: Array<(file: string, data: any) => unknown> = []
  private removeHandlers: Array<(file: string) => unknown> = []

  constructor(mq: MoquerieInstance) {
    this.mq = mq

    const cwd = this.mq.data.cwd

    this.jiti = createJITI(cwd, {
      requireCache: false,
      esmResolve: true,
    })
  }

  async init() {
    const ctx = await this.mq.getContext()

    const cwd = this.mq.data.cwd

    const watcher = this.watcher = watch(ctx.config.mockFiles ?? [], {
      cwd,
      ignored: [
        '**/node_modules/**',
      ],
    })

    watcher.on('add', (file) => {
      this.upsertFieldActions(file)
    })

    watcher.on('change', (file) => {
      this.upsertFieldActions(file)
    })

    watcher.on('unlink', (file) => {
      for (const handler of this.removeHandlers) {
        handler(file)
      }
    })

    return new Promise<void>((resolve) => {
      watcher.on('ready', () => {
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
    this.watcher?.close()
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
