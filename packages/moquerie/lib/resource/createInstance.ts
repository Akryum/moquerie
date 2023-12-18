import { nanoid } from 'nanoid'
import type { ResourceInstance } from '../../types/resource.js'
import { getResourceInstanceStorage } from './storage.js'

export interface CreateInstanceOptions {
  resourceName: string
  value: any
  tags?: string[]
  comment?: string
}

export async function createInstance(options: CreateInstanceOptions) {
  const { resourceName, value, tags, comment } = options
  const storage = await getResourceInstanceStorage(resourceName)

  const id = nanoid()

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

  return instance
}
