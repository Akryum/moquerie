import { getResolvedContext } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async () => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  return SuperJSON.stringify(ctx.schema)
})
