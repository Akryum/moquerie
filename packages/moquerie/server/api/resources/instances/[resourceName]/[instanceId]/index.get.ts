import SuperJSON from 'superjson'
import { findResourceInstanceById } from '~/lib/resource/find.js'

export default defineEventHandler(async (event) => {
  const { resourceName, instanceId } = getRouterParams(event)
  const instance = await findResourceInstanceById(resourceName, instanceId)
  return SuperJSON.stringify(instance)
})
