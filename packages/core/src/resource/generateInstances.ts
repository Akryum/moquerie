import { createInstanceFromFactory } from '../factory/createInstanceFromFactory.js'
import type { ResourceSchemaType } from '../types/resource.js'
import type { ResourceFactory } from '../types/factory.js'
import { getFactoryStorage } from '../factory/storage.js'
import { getResourceInstanceStorage } from './storage.js'

export interface GenerateResourceInstancesOptions {
  resourceType: ResourceSchemaType
  factory: ResourceFactory
  count: number
}

export async function generateResourceInstances(options: GenerateResourceInstancesOptions) {
  const { resourceType, factory, count } = options
  const storage = await getResourceInstanceStorage(resourceType.name)
  const instances = []
  for (let i = 0; i < count; i++) {
    const instance = await createInstanceFromFactory({
      factory,
      factoryDataContext: {},
      resourceType,
    })
    if (!resourceType.array) {
      instance.active = false
    }
    instances.push(instance)
    await storage?.save(instance)
  }

  const factoryStorage = await getFactoryStorage()
  await factoryStorage.save({
    ...factory,
    lastUsedAt: new Date(),
  })

  return instances
}
