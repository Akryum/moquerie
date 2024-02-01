import SuperJSON from 'superjson'
import { getFactoryStorage } from '@moquerie/core'
import type { DBLocation, ResourceFactory } from '@moquerie/core'

export default defineEventHandler<{ query: { resourceName: string, location?: DBLocation } }, Promise<ResourceFactory[]>>(async (event) => {
  const query = getQuery(event)
  const mq = getMq()
  const storage = await getFactoryStorage(mq)
  let factories: ResourceFactory[]
  if (query.location) {
    factories = await storage.findAllByLocation(query.location)
  }
  else {
    factories = await storage.findAll()
  }
  if (query.resourceName) {
    factories = factories.filter(factory => factory.resourceName === query.resourceName)
  }
  factories = factories.sort((a, b) => (b.lastUsedAt?.getTime() ?? 0) - (a.lastUsedAt?.getTime() ?? 0))
  return SuperJSON.stringify(factories) as unknown as ResourceFactory[]
})
