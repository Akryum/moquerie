import SuperJSON from 'superjson'
import { getFactoryStorage } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { factoryId } = getRouterParams(event)
  const storage = await getFactoryStorage()
  const data = await storage.findById(factoryId)
  return SuperJSON.stringify(data) as unknown as ResourceFactory
})
