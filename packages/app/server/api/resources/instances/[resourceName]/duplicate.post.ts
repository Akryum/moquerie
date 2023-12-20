import { nanoid } from 'nanoid'
import SuperJSON from 'superjson'
import { findResourceInstanceById, getResourceInstanceStorage } from '@moquerie/core'
import type { ResourceInstance } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { resourceName } = getRouterParams(event)
  const { ids } = await readBody(event)

  const copies = await Promise.all(ids.map(async (instanceId: string) => {
    const instance = await findResourceInstanceById(resourceName, instanceId)
    if (!instance) {
      throw new Error(`Resource instance not found: ${resourceName}/${instanceId}`)
    }
    const copy: ResourceInstance = {
      ...structuredClone(instance),
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: null,
    }
    const storage = await getResourceInstanceStorage(resourceName)
    await storage.save(copy)
    return copy
  }))

  return SuperJSON.stringify(copies)
})
