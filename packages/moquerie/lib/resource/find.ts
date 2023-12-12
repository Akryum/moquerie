import { getResourceInstanceStorage } from './storage.js'

export async function findResourceInstanceById(resourceTypeName: string, id: string) {
  const storage = await getResourceInstanceStorage(resourceTypeName)
  return storage.findById(id)
}
