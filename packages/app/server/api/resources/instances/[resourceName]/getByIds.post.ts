import SuperJSON from 'superjson'
import { findResourceInstanceById } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { resourceName } = getRouterParams(event)
  const { ids } = await readBody(event)

  const instances = await Promise.all(ids.map((id: string) => findResourceInstanceById(mq, resourceName, id)))
  return SuperJSON.stringify(instances.filter(Boolean))
})
