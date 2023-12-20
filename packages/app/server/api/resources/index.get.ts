import { createContext, getResourceSchema } from '@moquerie/core'

export default defineEventHandler(async () => {
  const ctx = await createContext()
  const schema = await getResourceSchema(ctx)
  return schema
})
