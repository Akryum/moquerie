import { type MergedStorage, useMergedStorage } from '../storage/mergedStorage.js'
import { getPrettyFilename } from '../util/fs.js'
import type { ResourceFactory } from '../types/factory.js'
import { projectHasTypescript } from '../util/env.js'

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
    filename: item => `${getPrettyFilename(item.resourceName)}/${getPrettyFilename(item.name)}.${projectHasTypescript() ? 'ts' : 'js'}`,
    format: 'js',
  })
  storage = await storagePromise
  return storage
}
