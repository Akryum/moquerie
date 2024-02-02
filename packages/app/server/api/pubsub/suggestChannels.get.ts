export default defineEventHandler(async () => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const result: string[] = []
  if (ctx.schema.types.Subscription) {
    result.push(...Object.keys(ctx.schema.types.Subscription.fields))
  }
  return result
})
