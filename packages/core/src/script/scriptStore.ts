import { MockFileHandler } from '../mock/mockFileHandler.js'
import type { ScriptItem, ScriptRunReport } from '../types/script.js'

export class ScriptStore extends MockFileHandler<ScriptItem> {
  reports: Map<string, ScriptRunReport> = new Map()

  constructor() {
    super('__scripts')
  }

  add(file: string, data: any): void {
    if (Array.isArray(data)) {
      for (const item of data) {
        this.items.push({
          file,
          ...item,
        })
      }
    }
    else {
      this.items.push({
        file,
        ...data,
      })
    }
  }
}
