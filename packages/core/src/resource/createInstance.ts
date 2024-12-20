import type { MoquerieInstance } from '../instance.js'
import type { ResourceInstance } from '../types/resource.js'
import { nanoid } from 'nanoid'
import { deactiveOtherSingletonResourceInstances } from './deactivateOthers.js'
import { createHistoryRecord } from './history.js'
import { getResourceInstanceStorage } from './storage.js'

export interface CreateInstanceOptions {
  resourceName: string
  value: any
  tags?: string[]
  comment?: string
  id?: string
  factoryId?: string
  save: boolean
}

export async function createResourceInstance(mq: MoquerieInstance, options: CreateInstanceOptions) {
  const { resourceName, value, tags, comment } = options

  const id = options.id ?? nanoid()

  const instance: ResourceInstance = {
    id,
    resourceName,
    createdAt: new Date(),
    updatedAt: null,
    active: true,
    value,
    tags: tags ?? [],
    comment: comment ?? null,
    factoryId: options.factoryId ?? null,
  }

  if (options.save) {
    const storage = await getResourceInstanceStorage(mq, resourceName)
    await storage.save(instance)
    await deactiveOtherSingletonResourceInstances(mq, resourceName, id)
    await createHistoryRecord(mq, {
      type: 'create',
      resourceName,
      instanceId: id,
      value,
    })
  }

  return instance
}
