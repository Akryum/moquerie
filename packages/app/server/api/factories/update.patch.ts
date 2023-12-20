import { getFactoryStorage } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'

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
