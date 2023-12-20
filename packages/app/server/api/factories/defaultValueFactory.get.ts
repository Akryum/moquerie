import { createDefaultValueFactory, getResolvedContext } from '@moquerie/core'

export default defineEventHandler<{ query: { resourceName: string } }>(async (event) => {
  const { resourceName } = getQuery(event)
  const ctx = await getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource ${resourceName} not found`)
  }
  const defaultValueFactory = createDefaultValueFactory({
    resourceType,
  })
  return {
    value: defaultValueFactory,
  }
})
