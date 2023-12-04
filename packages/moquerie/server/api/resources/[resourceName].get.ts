import { createContext } from '~/lib/context.js'
import { getResourceSchema } from '~/lib/resource.js'

export default defineEventHandler(async (event) => {
  const ctx = await createContext()
  const schema = await getResourceSchema(ctx)
  const { resourceName } = getRouterParams(event)
  return schema.types[resourceName]
})
