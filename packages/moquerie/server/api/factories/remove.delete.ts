import { getFactoryStorage } from '~/lib/factory/storage.js'

export default defineEventHandler<{ query: { id: string } }>(async (event) => {
  const { id } = getQuery(event)
  const storage = await getFactoryStorage()
  await storage.remove(id)
  return { id }
})
