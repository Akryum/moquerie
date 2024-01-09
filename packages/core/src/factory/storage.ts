import path from 'pathe'
import glob from 'fast-glob'
import { type MergedStorage, useMergedStorage } from '../storage/mergedStorage.js'
import type { ResourceFactory } from '../types/factory.js'
import { projectHasTypescript } from '../util/env.js'
import { type Storage, type StorageManifest, useStorage } from '../storage/storage.js'

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
    path: 'factories',
    filename: item => `${item.resourceName}/${item.name}.${projectHasTypescript() ? 'ts' : 'js'}`,
    format: 'js',
    override: {
      repository: {
        transform: {
          read: async (item, file) => {
            const resourceName = path.basename(path.dirname(file))
            const name = path.basename(file).replace(/\.[jt]s$/, '')
            const id = `${resourceName}-${name}`
            return {
              createdAt: new Date(),
              lastUsedAt: null,
              ...await getRepoMetaFactoryStorage().then(s => s.findById(id)),
              id,
              name,
              resourceName,
              location: 'repository',
              ...item,
            }
          },
          write: async (item) => {
            const data: Partial<ResourceFactory> = {
              ...item,
            }
            await getRepoMetaFactoryStorage().then(s => s.save({
              id: item.id,
              lastUsedAt: item.lastUsedAt,
              createdAt: item.createdAt,
              location: item.location,
            }))
            delete data.id
            delete data.name
            delete data.resourceName
            delete data.createdAt
            delete data.lastUsedAt
            delete data.location
            for (const key of Object.keys(data) as Array<keyof typeof data>) {
              if (data[key] === undefined || data[key] === null || data[key] === '') {
                delete data[key]
              }
            }
            return data
          },
        },
        manifest: {
          read: async (folder) => {
            const manifest: StorageManifest = {
              version: '0.0.1',
              files: {},
            }
            const files = await glob([
              '**/*.js',
              '**/*.ts',
            ], {
              cwd: folder,
            })
            for (const file of files) {
              const resourceName = path.basename(path.dirname(file))
              const id = `${resourceName}-${path.basename(file).replace(/\.[jt]s$/, '')}`
              manifest.files[id] = file
            }
            return manifest
          },
          write: () => {
            // Do not write to disk
          },
        },
        deduplicateFiles: false,
      },
    },
  })
  storage = await storagePromise
  return storage
}

let metaStorage: Storage<Partial<ResourceFactory> & { id: string }>
let metaStoragePromise: Promise<Storage<Partial<ResourceFactory> & { id: string }>>

/**
 * Store metadata about factories stored in the repository that is not explicitly stored in the factory files.
 */
async function getRepoMetaFactoryStorage() {
  if (metaStorage) {
    return metaStorage
  }
  if (metaStoragePromise) {
    return metaStoragePromise
  }
  metaStoragePromise = useStorage({
    path: 'factories-repo-meta',
    format: 'json',
    location: 'local',
  })
  metaStorage = await metaStoragePromise
  return metaStorage
}
