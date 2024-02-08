import SuperJSON from 'superjson'
import { getFactoryStorage } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { factoryId } = getRouterParams(event, {
    decode: true,
  })
  const mq = getMq()
  const storage = await getFactoryStorage(mq)
  const data = await storage.findById(factoryId)
  if (!data) {
    throw createError({
      status: 404,
      statusMessage: `Factory ${factoryId} not found`,
    })
  }
  return SuperJSON.stringify({
    ...data,
    ast: undefined,
  }) as unknown as ResourceFactory
})
