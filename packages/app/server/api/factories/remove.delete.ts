import { getFactoryStorage } from '@moquerie/core'

export default defineEventHandler<{ query: { id: string } }>(async (event) => {
  const { id } = getQuery(event)
  const storage = await getFactoryStorage()
  await storage.remove(id)
  return { id }
})
