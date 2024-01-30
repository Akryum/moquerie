import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async () => {
  const ctx = await getResolvedContext()
  const result: string[] = []
  if (ctx.schema.types.Subscription) {
    result.push(...Object.keys(ctx.schema.types.Subscription.fields))
  }
  return result
})
