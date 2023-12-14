import SuperJSON from 'superjson'
import { findAllResourceInstances } from '~/lib/resource/findAll.js'

export default defineEventHandler(async (event) => {
  const { resourceName } = getRouterParams(event)
  const { filterActive } = getQuery(event) as any

  const list = await findAllResourceInstances(resourceName, {
    filterActive,
  })
  return SuperJSON.stringify(list)
})
