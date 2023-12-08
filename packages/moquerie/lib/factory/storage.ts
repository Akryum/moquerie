import { type MergedStorage, useMergedStorage } from '../db/mergedStorage.js'
import type { ResourceFactory } from '~/types/factory.js'

let storage: MergedStorage<ResourceFactory>

export function getFactoryStorage() {
  if (!storage) {
    storage = useMergedStorage({
      name: 'factory',
    })
  }

  return storage
}
