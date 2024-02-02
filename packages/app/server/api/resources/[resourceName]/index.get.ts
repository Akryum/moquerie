export default defineEventHandler(async (event) => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const { resourceName } = getRouterParams(event)
  return ctx.schema.types[resourceName]
})
