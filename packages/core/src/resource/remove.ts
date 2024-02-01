import type { MoquerieInstance } from '../instance.js'
import { getResourceInstanceStorage } from './storage.js'

export async function removeResourceInstanceById(mq: MoquerieInstance, resourceTypeName: string, id: string): Promise<void> {
  const storage = await getResourceInstanceStorage(mq, resourceTypeName)
  await storage.remove(id)
}
