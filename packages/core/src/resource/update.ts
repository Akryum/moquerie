import type { MoquerieInstance } from '../instance.js'
import type { ResourceInstance } from '../types/resource.js'
import { diff } from 'just-diff'
import { deactiveOtherSingletonResourceInstances } from './deactivateOthers.js'
import { findResourceInstanceById } from './find.js'
import { createHistoryRecord } from './history.js'
import { getResourceInstanceStorage } from './storage.js'

export interface UpdateResourceInstanceByIdOptions {
  skipDeactivateOthers?: boolean
}

export async function updateResourceInstanceById(mq: MoquerieInstance, resourceName: string, instanceId: string, partialData: Partial<ResourceInstance>, options: UpdateResourceInstanceByIdOptions = {}) {
  const instance = await findResourceInstanceById(mq, resourceName, instanceId)

  if (!instance) {
    throw new Error(`Resource instance not found: ${resourceName}/${instanceId}`)
  }

  const newValue = {
    ...instance.value,
    ...partialData.value,
  }

  const data = {
    ...instance,
    ...partialData,
    value: newValue,
    updatedAt: new Date(),
  }

  const storage = await getResourceInstanceStorage(mq, resourceName)

  await storage.save(data)

  // History record
  const valueDiff = diff(instance.value, newValue)
  if (valueDiff.length > 0) {
    await createHistoryRecord(mq, {
      type: 'update',
      resourceName,
      instanceId,
      diff: valueDiff,
      value: instance.value,
    })
  }

  if (!options.skipDeactivateOthers && data.active) {
    await deactiveOtherSingletonResourceInstances(mq, resourceName, instanceId)
  }

  return data
}
