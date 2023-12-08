import { getFactoryStorage } from '~/lib/factory/storage.js'
import type { ResourceFactory } from '~/types/factory.js'

export default defineEventHandler<{ body: ResourceFactory }>(async (event) => {
  const body = await readBody(event)
  const storage = await getFactoryStorage()
  await storage.save(body, body.location)
  return body
})
