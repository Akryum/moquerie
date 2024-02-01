import type { MoquerieInstance } from '../instance.js'
import type { ResourceInstance } from '../types/resource.js'
import { deactiveOtherSingletonResourceInstances } from './deactivateOthers.js'
import { findResourceInstanceById } from './find.js'
import { getResourceInstanceStorage } from './storage.js'

export interface UpdateResourceInstanceByIdOptions {
  skipDeactivateOthers?: boolean
}

export async function updateResourceInstanceById(mq: MoquerieInstance, resourceName: string, instanceId: string, partialData: Partial<ResourceInstance>, options: UpdateResourceInstanceByIdOptions = {}) {
  const instance = await findResourceInstanceById(mq, resourceName, instanceId)

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

  const storage = await getResourceInstanceStorage(mq, resourceName)

  await storage.save(data)

  if (!options.skipDeactivateOthers && data.active) {
    await deactiveOtherSingletonResourceInstances(mq, resourceName, instanceId)
  }

  return data
}
