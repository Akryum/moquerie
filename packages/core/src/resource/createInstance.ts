import { nanoid } from 'nanoid'
import type { ResourceInstance } from '../types/resource.js'
import type { MoquerieInstance } from '../instance.js'
import { getResourceInstanceStorage } from './storage.js'
import { deactiveOtherSingletonResourceInstances } from './deactivateOthers.js'

export interface CreateInstanceOptions {
  resourceName: string
  value: any
  tags?: string[]
  comment?: string
  id?: string
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
    factoryId: null,
  }

  if (options.save) {
    const storage = await getResourceInstanceStorage(mq, resourceName)
    await storage.save(instance)
    await deactiveOtherSingletonResourceInstances(mq, resourceName, id)
  }

  return instance
}
