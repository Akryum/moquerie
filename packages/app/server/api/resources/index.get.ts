import { getResolvedContext } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async () => {
  const ctx = await getResolvedContext()
  return SuperJSON.stringify(ctx.schema)
})
