import type { ResourceInstance } from '@moquerie/core'
import { deactiveOtherSingletonResourceInstances, findResourceInstanceById, getResourceInstanceStorage } from '@moquerie/core'
import { nanoid } from 'nanoid'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { resourceName } = getRouterParams(event)
  const { ids } = await readBody(event)

  const ctx = await mq.getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource not found: ${resourceName}`)
  }

  const copies = await Promise.all((ids as string[]).map(async (instanceId, index) => {
    const instance = await findResourceInstanceById(mq, resourceName, instanceId)
    if (!instance) {
      throw new Error(`Resource instance not found: ${resourceName}/${instanceId}`)
    }
    const copy: ResourceInstance = {
      ...structuredClone(instance),
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: null,
      active: resourceType.array || index === ids.length - 1,
    }
    const storage = await getResourceInstanceStorage(mq, resourceName)
    await storage.save(copy)

    if (copy.active) {
      await deactiveOtherSingletonResourceInstances(mq, resourceName, copy.id)
    }

    return copy
  }))

  return SuperJSON.stringify(copies)
})
