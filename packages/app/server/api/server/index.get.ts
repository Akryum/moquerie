import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async () => {
  const ctx = await getResolvedContext()

  return {
    port: ctx.context.port,
    routeInfos: ctx.server.routeInfos,
  }
})
