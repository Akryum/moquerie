import { createContext } from '~/lib/context.js'
import { createInstanceFromFactory } from '~/lib/factory/createInstanceFromFactory.js'
import { getResourceSchema } from '~/lib/resource.js'
import type { ResourceFactory } from '~/types/factory.js'

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
