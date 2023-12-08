import { getFactoryStorage } from '~/lib/factory/storage.js'
import type { ResourceFactory } from '~/types/factory.js'

export default defineEventHandler<{ body: ResourceFactory }>(async (event) => {
  const body = await readBody(event)
  const storage = await getFactoryStorage()
  const factory = await storage.findById(body.id)
  if (!factory) {
    throw new Error(`Factory ${body.id} not found`)
  }
  Object.assign(factory, body)
  await storage.save(factory, factory.location)
  return body
})
