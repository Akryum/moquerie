import { createInstanceFromFactory } from '../factory/createInstanceFromFactory.js'
import type { ResourceSchemaType } from '../types/resource.js'
import type { ResourceFactory } from '../types/factory.js'
import { getFactoryStorage } from '../factory/storage.js'
import type { MoquerieInstance } from '../instance.js'
import { getResourceInstanceStorage } from './storage.js'

export interface GenerateResourceInstancesOptions {
  resourceType: ResourceSchemaType
  factory: ResourceFactory
  count: number
}

export async function generateResourceInstances(mq: MoquerieInstance, options: GenerateResourceInstancesOptions) {
  const { resourceType, factory, count } = options
  const storage = await getResourceInstanceStorage(mq, resourceType.name)
  const instances = []
  for (let i = 0; i < count; i++) {
    const instance = await createInstanceFromFactory(mq, {
      factory,
      save: true,
    })
    if (!resourceType.array) {
      instance.active = false
    }
    instances.push(instance)
    await storage?.save(instance)
  }

  const factoryStorage = await getFactoryStorage(mq)
  await factoryStorage.save({
    ...factory,
    lastUsedAt: new Date(),
  })

  return instances
}
