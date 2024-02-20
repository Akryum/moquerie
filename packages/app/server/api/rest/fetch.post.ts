export default defineEventHandler(async (event) => {
  const mq = await getMq()
  const ctx = await mq.getResolvedContext()

  const body = await readBody(event) as {
    path: string
    method: string
    query?: Record<string, string>
    body?: any
  }

  let url: string

  if (body.path.startsWith('http')) {
    url = body.path
  }
  else {
    if (!body.path.startsWith('/')) {
      body.path = `/${body.path}`
    }

    const routeInfo = ctx.server.routeInfos.find(r => r.type === 'rest')
    if (!routeInfo) {
      throw new Error('RouteInfo not found')
    }
    url = `${routeInfo.url}${body.path}`
  }

  const result = await $fetch(url, {
    method: body.method as any,
    query: body.query,
    body: (body.method.toLowerCase() === 'get') ? undefined : body.body,
  })
  return result
})
