import { type MergedStorage, useMergedStorage } from '../db/mergedStorage.js'
import type { ResourceFactory } from '~/types/factory.js'

let storage: MergedStorage<ResourceFactory>
let storagePromise: Promise<MergedStorage<ResourceFactory>>

export async function getFactoryStorage() {
  if (storage) {
    return storage
  }
  if (storagePromise) {
    return storagePromise
  }
  storagePromise = useMergedStorage({
    name: 'factory',
  })
  storage = await storagePromise
  return storage
}
