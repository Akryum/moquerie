import deepmerge from 'deepmerge/index.js'
import { findResourceInstanceById } from './find.js'
import { getResourceInstanceStorage } from './storage.js'
import type { ResourceInstance } from '~/types/resource.js'

export async function updateResourceInstanceById(resourceName: string, instanceId: string, partialData: Partial<ResourceInstance>) {
  const instance = await findResourceInstanceById(resourceName, instanceId)

  if (!instance) {
    throw new Error(`Resource instance not found: ${resourceName}/${instanceId}`)
  }

  const data = deepmerge.all([instance, partialData, {
    updatedAt: new Date(),
  }]) as ResourceInstance

  const storage = await getResourceInstanceStorage(resourceName)

  await storage.save(data)

  return data
}
