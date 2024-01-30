import { getFactoryStorage } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { factoryId } = getRouterParams(event)
  const storage = await getFactoryStorage()
  await storage.remove(factoryId)
  return { id: factoryId }
})
