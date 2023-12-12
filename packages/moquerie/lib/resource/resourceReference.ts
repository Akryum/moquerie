import type { ResourceInstanceReference } from '~/types/resource.js'

export function createResourceInstanceReference(resourceTypeName: string, id: string): ResourceInstanceReference {
  return {
    __resourceType: resourceTypeName,
    __id: id,
  }
}
