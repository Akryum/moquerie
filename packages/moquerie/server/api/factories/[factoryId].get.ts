import { getFactoryStorage } from '~/lib/factory/storage.js'

export default defineEventHandler(async (event) => {
  const { factoryId } = getRouterParams(event)
  const storage = await getFactoryStorage()
  return storage.findById(factoryId)
})
