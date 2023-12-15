import { removeResourceInstanceById } from '~/lib/resource/remove.js'

export default defineEventHandler(async (event) => {
  const { resourceName } = getRouterParams(event)
  const { ids } = await readBody(event)

  await Promise.all(ids.map((id: string) => removeResourceInstanceById(resourceName, id)))
})
