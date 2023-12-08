import SuperJSON from 'superjson'
import { getFactoryStorage } from '~/lib/factory/storage.js'
import type { ResourceFactory } from '~/types/factory.js'

export default defineEventHandler(async (event) => {
  const { factoryId } = getRouterParams(event)
  const storage = await getFactoryStorage()
  const data = await storage.findById(factoryId)
  return SuperJSON.stringify(data) as unknown as ResourceFactory
})
