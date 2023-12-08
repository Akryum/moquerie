import { nanoid } from 'nanoid'
import { getFactoryStorage } from '~/lib/factory/storage.js'
import type { ResourceFactory } from '~/types/factory.js'

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
