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
