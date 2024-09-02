import fs from 'node:fs'
import path from 'pathe'
import glob from 'fast-glob'
import { type MergedStorage, useMergedStorage } from '../storage/mergedStorage.js'
import type { ResourceFactory } from '../types/factory.js'
import { projectHasTypescript } from '../util/env.js'
import { type Storage, type StorageManifest, useStorage } from '../storage/storage.js'
import type { DBLocation } from '../types/db.js'
import { printCode } from '../ast/print.js'
import type { MoquerieInstance } from '../instance.js'
import { hooks } from '../hooks.js'
import { deserializeFactory } from './deserialize.js'
import { serializeFactory } from './serialize.js'

export function getFactoryFilename(mq: MoquerieInstance, resourceName: string, id: string, name: string, location: DBLocation) {
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const [, idPart] = /.+?(@@.+)?$/.exec(id) ?? []
  return `${resourceName}/${name}${location === 'local' ? idPart ?? '' : ''}.${projectHasTypescript(mq) ? 'ts' : 'js'}`
}

let storage: MergedStorage<ResourceFactory>
let storagePromise: Promise<MergedStorage<ResourceFactory>>

export async function getFactoryStorage(mq: MoquerieInstance) {
  if (storage) {
    return storage
  }
  if (storagePromise) {
    return storagePromise
  }

  async function readFactory(file: string, location: DBLocation) {
    const resourceName = path.basename(path.dirname(file))
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    const [, name, idPart] = /(.+?)(@@.+)?\.[jt]s$/.exec(path.basename(file)) ?? []
    const id = `${resourceName}-${idPart ?? name}`

    const content = await fs.promises.readFile(file, 'utf8')
    const result = await deserializeFactory(content)

    const extra = await getRepoMetaFactoryStorage(mq).then(s => s.findById(id))

    const factory: ResourceFactory = {
      ...extra,
      ...result,
      id,
      name,
      resourceName,
      location,
      file,
    }

    return factory
  }

  async function write(file: string, item: ResourceFactory) {
    await getRepoMetaFactoryStorage(mq).then(s => s.save({
      id: item.id,
      lastUsedAt: item.lastUsedAt,
    }))

    const ast = await serializeFactory(item)
    let code = printCode(ast)

    try {
      await hooks.callHookWith(async (cbs) => {
        for (const cb of cbs) {
          const result = await cb({ path: file, code, type: 'factory' })
          if (typeof result === 'string') {
            code = result
          }
        }
      }, 'writeCode')
    }
    catch (error: any) {
      console.error(`Error in plugin hook "writeCode" (factory) (${file})`, error.stack ?? error)
    }

    await fs.promises.writeFile(file, code, 'utf8')
  }

  storagePromise = useMergedStorage(mq, {
    path: 'factories',
    format: 'js',

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
          // eslint-disable-next-line regexp/no-super-linear-backtracking
          const [, name, idPart] = /(.+?)(@@.+)?\.[jt]s$/.exec(path.basename(file)) ?? []
          const id = `${resourceName}-${idPart ?? name}`
          manifest.files[id] = file
        }
        return manifest
      },
      write: () => {
        // Do not write to disk
      },
    },

    deduplicateFiles: false,

    override: {
      local: {
        filename: item => getFactoryFilename(mq, item.resourceName, item.id, item.name, 'local'),
        file: {
          read: async file => readFactory(file, 'local'),
          write,
        },
      },

      repository: {
        filename: item => getFactoryFilename(mq, item.resourceName, item.id, item.name, 'repository'),
        file: {
          read: async file => readFactory(file, 'repository'),
          write,
        },
      },
    },
  })
  storage = await storagePromise
  return storage
}

type ExtraFractoryData = Pick<ResourceFactory, 'id' | 'lastUsedAt'>

let metaStorage: Storage<ExtraFractoryData>
let metaStoragePromise: Promise<Storage<ExtraFractoryData>>

/**
 * Store metadata about factories stored in the repository that is not explicitly stored in the factory files.
 */
async function getRepoMetaFactoryStorage(mq: MoquerieInstance) {
  if (metaStorage) {
    return metaStorage
  }
  if (metaStoragePromise) {
    return metaStoragePromise
  }
  metaStoragePromise = useStorage(mq, {
    path: 'factories-repo-meta',
    format: 'json',
    location: 'local',
  })
  metaStorage = await metaStoragePromise
  return metaStorage
}

export async function getFactoryByName(mq: MoquerieInstance, name: string) {
  const storage = await getFactoryStorage(mq)
  const factories = await storage.findAll()
  const factory = factories.find(f => f.name === name)
  if (!factory) {
    throw new Error(`Factory not found: ${name}`)
  }
  return factory
}
