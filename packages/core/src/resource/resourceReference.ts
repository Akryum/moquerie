import type { MoquerieInstance } from '../instance.js'
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

export async function hydrateResourceInstanceReferences(mq: MoquerieInstance, value: any): Promise<any> {
  if (Array.isArray(value)) {
    return Promise.all(value.map(item => hydrateResourceInstanceReferences(mq, item)))
  }
  else if (value && typeof value === 'object') {
    if (isResourceInstanceReference(value)) {
      const ctx = await mq.getResolvedContext()
      return ctx.db[value.__resourceName].findByInstanceId(value.__id)
    }
    else {
      const result: Record<string, any> = {}
      for (const key in value) {
        result[key] = await hydrateResourceInstanceReferences(mq, value[key])
      }
      return result
    }
  }
  else {
    return value
  }
}

/**
 * Tag object added to the instance values when they are retrieved with the `db` API.
 * This allows tracking the resource name and instance ID of the value.
 */
export const instanceValueRefSymbol = Symbol('instanceValueRef')

export interface InstanceValueTag {
  [instanceValueRefSymbol]: {
    resourceName: string
    instanceId: string
  }
}

export function hasInstanceValueTag(value: any): value is InstanceValueTag {
  return typeof value === 'object' && value !== null && instanceValueRefSymbol in value
}

export function addInstanceValueTag(value: any, resourceName: string, instanceId: string) {
  Object.defineProperty(value, instanceValueRefSymbol, {
    enumerable: false,
    value: {
      resourceName,
      instanceId,
    },
  })
}

/**
 * Transform resource instance values contained to instance references.
 * The values must come from the `db` API so they have the necessary tags.
 */
export function serializeToReferences(value: any): any {
  if (Array.isArray(value)) {
    return Promise.all(value.map(item => serializeToReferences(item)))
  }
  else if (value && typeof value === 'object') {
    if (hasInstanceValueTag(value)) {
      return createResourceInstanceReference(value[instanceValueRefSymbol].resourceName, value[instanceValueRefSymbol].instanceId)
    }
    else {
      const result: Record<string, any> = {}
      for (const key in value) {
        result[key] = serializeToReferences(value[key])
      }
      return result
    }
  }
  else {
    return value
  }
}
