export default defineEventHandler(async (event) => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const { resourceName } = getRouterParams(event)
  return ctx.schema.ignoredInExplorer?.some((filter) => {
    if (typeof filter === 'string') {
      return filter === resourceName
    }
    else if (filter instanceof RegExp) {
      return filter.test(resourceName)
    }
    return false
  }) ?? false
})
