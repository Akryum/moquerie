import { getFactoryStorage } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { factoryId } = getRouterParams(event, {
    decode: true,
  })
  const mq = getMq()
  const storage = await getFactoryStorage(mq)
  await storage.remove(factoryId)
  return { id: factoryId }
})
