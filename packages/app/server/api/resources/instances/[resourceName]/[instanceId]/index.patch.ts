import SuperJSON from 'superjson'
import { updateResourceInstanceById } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { resourceName, instanceId } = getRouterParams(event)
  const body = await readBody(event)
  const data = await updateResourceInstanceById(resourceName, instanceId, body)
  return SuperJSON.stringify(data)
})
