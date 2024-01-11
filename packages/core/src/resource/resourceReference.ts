import { getResolvedContext } from '../context.js'
import type { ResourceInstanceReference } from '../types/resource.js'

export function createResourceInstanceReference(resourceTypeName: string, id: string): ResourceInstanceReference {
  return {
    __resourceName: resourceTypeName,
    __id: id,
  }
}

export function isResourceInstanceReference(value: unknown): value is ResourceInstanceReference {
  return typeof value === 'object' && value !== null && '__resourceName' in value && '__id' in value
}

export async function hydrateResourceInstanceReferences(value: any): Promise<any> {
  if (Array.isArray(value)) {
    return Promise.all(value.map(item => hydrateResourceInstanceReferences(item)))
  }
  else if (value && typeof value === 'object') {
    if (isResourceInstanceReference(value)) {
      const ctx = await getResolvedContext()
      return ctx.db[value.__resourceName].findByInstanceId(value.__id)
    }
    else {
      const result: Record<string, any> = {}
      for (const key in value) {
        result[key] = await hydrateResourceInstanceReferences(value[key])
      }
      return result
    }
  }
  else {
    return value
  }
}
