import path from 'pathe'
import glob from 'fast-glob'
import { type MergedStorage, useMergedStorage } from '../storage/mergedStorage.js'
import type { ResourceFactory } from '../types/factory.js'
import type { StorageManifest } from '../storage/storage.js'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import type { MoquerieInstance } from '../instance.js'

let storage: MergedStorage<DatabaseSnapshot>
let storagePromise: Promise<MergedStorage<DatabaseSnapshot>>

export async function getSnapshotStorage(mq: MoquerieInstance) {
  if (storage) {
    return storage
  }
  if (storagePromise) {
    return storagePromise
  }
  storagePromise = useMergedStorage(mq, {
    path: 'snapshots',
    filename: item => `${item.id}/snapshot.json`,
    format: 'json',
    override: {
      repository: {
        transform: {
          read: async (item, file) => {
            const id = path.basename(path.dirname(file))
            return {
              id,
              location: 'repository',
              ...item,
            }
          },
          write: async (item) => {
            const data: Partial<ResourceFactory> = {
              ...item,
            }
            delete data.id
            delete data.location
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
              '**/snapshot.json',
            ], {
              cwd: folder,
            })
            for (const file of files) {
              const id = path.basename(path.dirname(file))
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

export async function getSnapshot(mq: MoquerieInstance, id: string): Promise<DatabaseSnapshot> {
  const storage = await getSnapshotStorage(mq)
  const snapshot = await storage.findById(id)
  if (!snapshot) {
    throw new Error(`Snapshot not found: ${id}`)
  }
  return snapshot
}
