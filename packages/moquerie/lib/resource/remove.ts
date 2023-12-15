import { getResourceInstanceStorage } from './storage.js'

export async function removeResourceInstanceById(resourceTypeName: string, id: string): Promise<void> {
  const storage = await getResourceInstanceStorage(resourceTypeName)
  await storage.remove(id)
}
