import { updateResourceInstanceById } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { resourceName } = getRouterParams(event)
  const body = await readBody(event)
  const { ids, data } = body
  await Promise.all(ids.map((id: string) => updateResourceInstanceById(mq, resourceName, id, data)))
})
