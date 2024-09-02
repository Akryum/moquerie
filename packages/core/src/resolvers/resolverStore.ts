import { MockFileHandler } from '../mock/mockFileHandler.js'
import type { Resolver } from '../types/resolver.js'

/**
 * @deprecated use `ResolverStore` instead
 */
export class FieldActionStore extends MockFileHandler<Resolver> {
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

export class ResolverStore extends MockFileHandler<Resolver> {
  constructor() {
    super('__resolvers')
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
