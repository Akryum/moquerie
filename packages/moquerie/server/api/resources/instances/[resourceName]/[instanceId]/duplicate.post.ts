import { nanoid } from 'nanoid'
import SuperJSON from 'superjson'
import { findResourceInstanceById } from '~/lib/resource/find.js'
import { getResourceInstanceStorage } from '~/lib/resource/storage.js'
import type { ResourceInstance } from '~/types/resource.js'

export default defineEventHandler(async (event) => {
  const { resourceName, instanceId } = getRouterParams(event)
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
  return SuperJSON.stringify(copy)
})
