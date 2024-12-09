import type { MoquerieInstance } from '../instance.js'
import type { Resolver, ResolverBaseDefinitions } from '../types/resolver.js'
import { MockFileHandler } from '../mock/mockFileHandler.js'

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

export async function addResolvers(mq: MoquerieInstance, resolvers: ResolverBaseDefinitions) {
  const ctx = await mq.getResolvedContext()
  for (const resourceName in resolvers) {
    for (const fieldName in resolvers[resourceName]) {
      const action = resolvers[resourceName][fieldName]
      ctx.resolvers.items.push({
        resourceName,
        fieldName,
        action,
        file: '__added-resolver',
      })
    }
  }
}
