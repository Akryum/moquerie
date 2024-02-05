import { MockFileHandler } from '../mock/mockFileHandler.js'
import type { FieldAction } from '../types/fieldAction.js'

export class FieldActionStore extends MockFileHandler<FieldAction> {
  constructor() {
    super('__fieldActions')
  }

  add(file: string, data: any): void {
    for (const resourceName in data) {
      const actions = data[resourceName]
      for (const fieldName in actions) {
        const existingIndex = this.items.findIndex(action => action.resourceName === resourceName && action.fieldName === fieldName)
        if (existingIndex !== -1) {
          this.items.splice(existingIndex, 1)
        }

        const action = actions[fieldName]
        this.items.push({
          resourceName,
          fieldName,
          action,
          file,
        })
      }
    }
  }
}
