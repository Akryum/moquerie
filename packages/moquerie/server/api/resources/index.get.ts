import { createContext } from '~/lib/context.js'
import { getResourceSchema } from '~/lib/resource.js'

export default defineEventHandler(async () => {
  const ctx = await createContext()
  const schema = await getResourceSchema(ctx)
  return schema
})
