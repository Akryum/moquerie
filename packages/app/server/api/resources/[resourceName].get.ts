import { createContext, getResourceSchema } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const ctx = await createContext()
  const schema = await getResourceSchema(ctx)
  const { resourceName } = getRouterParams(event)
  return schema.types[resourceName]
})
