import { nanoid } from 'nanoid'
import { getFactoryStorage } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const storage = await getFactoryStorage()
  const id = nanoid()
  const factory: ResourceFactory = {
    id,
    createdAt: new Date(),
    lastUsedAt: null,
    ...body,
  }
  await storage.save(factory, factory.location)
  return factory
})
