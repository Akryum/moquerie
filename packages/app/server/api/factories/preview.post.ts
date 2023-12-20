import { createContext, createInstanceFromFactory, getResourceSchema } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'

export default defineEventHandler<{ body: ResourceFactory }>(async (event) => {
  const ctx = await createContext()
  const schema = await getResourceSchema(ctx)
  const factory = await readBody(event)
  const resourceType = schema.types[factory.resourceName]
  if (!resourceType) {
    throw new Error(`Resource type ${factory.resourceName} not found`)
  }
  const instance = await createInstanceFromFactory({
    resourceType,
    factory: {
      ...factory,
      fakerSeed: undefined,
    },
    factoryDataContext: {},
    skipEnforceUnique: true,
  })
  return instance.value
})
