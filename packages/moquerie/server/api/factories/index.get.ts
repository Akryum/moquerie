import SuperJSON from 'superjson'
import { getFactoryStorage } from '~/lib/factory/storage.js'
import type { DBLocation } from '~/types/db.js'
import type { ResourceFactory } from '~/types/factory.js'

export default defineEventHandler<{ query: { resourceName: string, location?: DBLocation } }, Promise<ResourceFactory[]>>(async (event) => {
  const query = getQuery(event)
  const storage = await getFactoryStorage()
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
  factories.reverse()
  return SuperJSON.stringify(factories) as unknown as ResourceFactory[]
})
