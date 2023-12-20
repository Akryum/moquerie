import { createInstanceFromFactory, getResolvedContext } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'

export default defineEventHandler<{ body: ResourceFactory }>(async (event) => {
  const ctx = await getResolvedContext()
  const factory = await readBody(event)
  const resourceType = ctx.schema.types[factory.resourceName]
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
