export default defineEventHandler(async () => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()

  return {
    port: ctx.context.port,
    routeInfos: ctx.server.routeInfos,
  }
})
