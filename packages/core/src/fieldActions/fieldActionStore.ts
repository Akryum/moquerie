import type { FieldAction } from '../types/fieldAction.js'

export class FieldActionStore {
  allActions: FieldAction[] = []

  handleMockFile(file: string, data: any) {
    // Cleanup
    this.allActions = this.allActions.filter(action => action.file !== file)

    if (data.__fieldActions) {
      const actionsMap = data.__fieldActions
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

  handleMockFileRemoved(file: string) {
    this.removeFieldActions(file)
  }

  removeFieldActions(file: string) {
    this.allActions = this.allActions.filter(action => action.file !== file)
  }

  destroy() {
    this.allActions.length = 0
  }
}
