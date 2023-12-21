import type { ResourceInstance } from '../types/resource.js'
import { findResourceInstanceById } from './find.js'
import { getResourceInstanceStorage } from './storage.js'

export async function updateResourceInstanceById(resourceName: string, instanceId: string, partialData: Partial<ResourceInstance>) {
  const instance = await findResourceInstanceById(resourceName, instanceId)

  if (!instance) {
    throw new Error(`Resource instance not found: ${resourceName}/${instanceId}`)
  }

  const data = {
    ...instance,
    ...partialData,
    value: {
      ...instance.value,
      ...partialData.value,
    },
    updatedAt: new Date(),
  }

  const storage = await getResourceInstanceStorage(resourceName)

  await storage.save(data)

  return data
}
