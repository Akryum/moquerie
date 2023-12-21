import { nanoid } from 'nanoid'
import type { ResourceInstance } from '../types/resource.js'
import { getResourceInstanceStorage } from './storage.js'
import { deactiveOtherSingletonResourceInstances } from './deactivateOthers.js'

export interface CreateInstanceOptions {
  resourceName: string
  value: any
  tags?: string[]
  comment?: string
  id?: string
}

export async function createResourceInstance(options: CreateInstanceOptions) {
  const { resourceName, value, tags, comment } = options
  const storage = await getResourceInstanceStorage(resourceName)

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

  await storage.save(instance)

  await deactiveOtherSingletonResourceInstances(resourceName, id)

  return instance
}
