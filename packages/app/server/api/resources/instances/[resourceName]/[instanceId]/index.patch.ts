import SuperJSON from 'superjson'
import { updateResourceInstanceById } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { resourceName, instanceId } = getRouterParams(event)
  const body = await readBody(event)
  const data = await updateResourceInstanceById(mq, resourceName, instanceId, body)
  return SuperJSON.stringify(data)
})
