import SuperJSON from 'superjson'
import { findResourceInstanceById } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { resourceName, instanceId } = getRouterParams(event)
  const instance = await findResourceInstanceById(resourceName, instanceId)
  return SuperJSON.stringify(instance)
})
