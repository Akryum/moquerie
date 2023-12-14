import { updateResourceInstanceById } from '~/lib/resource/update.js'

export default defineEventHandler(async (event) => {
  const { resourceName } = getRouterParams(event)
  const body = await readBody(event)
  const { ids, data } = body
  await Promise.all(ids.map((id: string) => updateResourceInstanceById(resourceName, id, data)))
})
