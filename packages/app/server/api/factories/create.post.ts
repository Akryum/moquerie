import { nanoid } from 'nanoid'
import { getFactoryStorage } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'
import type { FactoryData } from '~/components/factory/formTypes.js'

export default defineEventHandler(async (event) => {
  const body: FactoryData = await readBody(event)
  const storage = await getFactoryStorage()
  const id = body.location === 'repository' ? `${body.resourceName}-${body.name}` : nanoid()

  if (await storage.findById(id)) {
    throw new Error(`Factory with id "${id}" already exists`)
  }

  const factory: ResourceFactory = {
    id,
    createdAt: new Date(),
    lastUsedAt: null,
    ...body,
  }
  await storage.save(factory, factory.location)
  return factory
})
