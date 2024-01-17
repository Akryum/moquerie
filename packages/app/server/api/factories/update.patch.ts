import { nanoid } from 'nanoid'
import { getFactoryStorage } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'

export default defineEventHandler<{ body: ResourceFactory }>(async (event) => {
  const body = await readBody(event)
  const storage = await getFactoryStorage()

  const factory = await storage.findById(body.id)
  if (!factory) {
    throw new Error(`Factory ${body.id} not found`)
  }

  if (factory.location !== body.location) {
    if (body.location === 'local') {
      // Override id with random one
      await storage.remove(factory.id)
      body.id = factory.id = nanoid()
    }
    else if (body.location === 'repository') {
      // Use name as id
      const name = body.name ?? factory.name
      if (await storage.findById(name, 'repository')) {
        throw new Error(`Factory with name "${name}" already exists in repository`)
      }
      await storage.remove(factory.id)
      body.id = factory.id = `${body.resourceName ?? factory.resourceName}-${name}`
    }
  }
  Object.assign(factory, body)
  await storage.save(factory, factory.location)
  return factory
})
