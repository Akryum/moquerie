import { removeResourceInstanceById } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { resourceName } = getRouterParams(event)
  const { ids } = await readBody(event)

  await Promise.all(ids.map((id: string) => removeResourceInstanceById(mq, resourceName, id)))
})
