import type { ResourceFactory } from '@moquerie/core'
import { createDefaultValueFactory, createInstanceFromFactory, getResolvedContext } from '@moquerie/core'

export default defineEventHandler<{ query: { resourceName: string } }>(async (event) => {
  const { resourceName } = getQuery(event)
  const ctx = await getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource ${resourceName} not found`)
  }
  const defaultValueFactory = createDefaultValueFactory({
    resourceType,
    randomRefs: false,
  })
  const factory: ResourceFactory = {
    id: 'default-preview',
    createdAt: new Date(),
    lastUsedAt: null,
    applyTags: [],
    createPrompts: [],
    createValue: defaultValueFactory,
    location: 'local',
    name: 'default values',
    resourceName,
    tags: [],
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
