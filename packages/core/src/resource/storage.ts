import type { Storage } from '../storage/storage.js'
import { useStorage } from '../storage/storage.js'
import type { ResourceInstance } from '../types/resource.js'

const storage: Map<string, Storage<ResourceInstance>> = new Map()
const storagePromise: Map<string, Promise<Storage<ResourceInstance>>> = new Map()

export async function getResourceInstanceStorage(resourceTypeName: string): Promise<Storage<ResourceInstance>> {
  if (storage.has(resourceTypeName)) {
    return storage.get(resourceTypeName)!
  }
  if (storagePromise.has(resourceTypeName)) {
    return storagePromise.get(resourceTypeName)!
  }
  const promise = useStorage<ResourceInstance>({
    name: `resource-instance/${resourceTypeName}`,
    location: 'local',
  })
  storagePromise.set(resourceTypeName, promise)
  try {
    const s = await promise
    storage.set(resourceTypeName, s)
    return s
  }
  finally {
    storagePromise.delete(resourceTypeName)
  }
}
