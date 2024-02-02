import type { MoquerieInstance } from '../instance.js'
import { createHistoryRecord } from './history.js'
import { getResourceInstanceStorage } from './storage.js'

export async function removeResourceInstanceById(mq: MoquerieInstance, resourceTypeName: string, id: string): Promise<void> {
  const storage = await getResourceInstanceStorage(mq, resourceTypeName)
  await storage.remove(id)
  await createHistoryRecord(mq, {
    type: 'delete',
    resourceName: resourceTypeName,
    instanceId: id,
  })
}
