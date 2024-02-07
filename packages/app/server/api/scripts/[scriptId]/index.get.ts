export default defineEventHandler(async (event) => {
  const { scriptId } = getRouterParams(event)

  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  return ctx.scripts.items.find(item => item.id === scriptId)
})
