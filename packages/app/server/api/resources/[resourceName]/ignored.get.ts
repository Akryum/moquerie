import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const ctx = await getResolvedContext()
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
