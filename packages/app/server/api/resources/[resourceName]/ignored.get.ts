import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const ctx = await getResolvedContext()
  const { resourceName } = getRouterParams(event)
  return ctx.schema.ignoredInExplorer?.includes(resourceName) ?? false
})
