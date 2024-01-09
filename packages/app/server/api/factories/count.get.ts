import { getFactoryStorage } from '@moquerie/core'
import type { DBLocation } from '@moquerie/core'

export default defineEventHandler<{ query: { resourceName: string, location?: DBLocation } }, Promise<Record<DBLocation, number>>>(async (event) => {
  const query = getQuery(event)
  const storage = await getFactoryStorage()
  let factories = await storage.findAll()
  if (query.resourceName) {
    factories = factories.filter(factory => factory.resourceName === query.resourceName)
  }
  const result: Record<DBLocation, number> = {
    local: 0,
    repository: 0,
  }
  for (const factory of factories) {
    result[factory.location]++
  }
  return result
})
