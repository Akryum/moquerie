import type { MoquerieInstance } from '../instance.js'
import { getResourceInstanceStorage } from './storage.js'

export async function findResourceInstanceById(mq: MoquerieInstance, resourceTypeName: string, id: string) {
  const storage = await getResourceInstanceStorage(mq, resourceTypeName)
  return storage.findById(id)
}
