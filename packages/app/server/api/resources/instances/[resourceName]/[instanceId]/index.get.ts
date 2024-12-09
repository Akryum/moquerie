import { findResourceInstanceById } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { resourceName, instanceId } = getRouterParams(event)
  const instance = await findResourceInstanceById(mq, resourceName, instanceId)
  return SuperJSON.stringify(instance)
})
