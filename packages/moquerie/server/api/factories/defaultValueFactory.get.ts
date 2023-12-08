import { createContext } from '~/lib/context.js'
import { createDefaultValueFactory } from '~/lib/factory/createDefaultValueFactory.js'
import { getResourceSchema } from '~/lib/resource.js'

export default defineEventHandler<{ query: { resourceName: string } }>(async (event) => {
  const { resourceName } = getQuery(event)
  const ctx = await createContext()
  const { types } = await getResourceSchema(ctx)
  const resourceType = types[resourceName]
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
