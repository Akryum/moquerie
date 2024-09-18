import fs from 'node:fs'
import path from 'pathe'
import SuperJSON from 'superjson'
import type { DBLocation } from '../types/db.js'
import { getCurrentUser } from '../user/getCurrentUser.js'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { getCurrentBranchFolder } from '../resource/branch.js'
import { getResourceInstanceStorage } from '../resource/storage.js'
import type { MoquerieInstance } from '../instance.js'
import { ensureDir } from '../util/fs.js'
import { getSnapshotFolder } from './folder.js'
import { getSnapshotStorage } from './storage.js'

export interface CreateSnapshotOptions {
  id: string
  location: DBLocation
  description?: string
  tags: string[]
  resources?: { [resourceName: string]: string[] }
}

export async function createSnapshot(mq: MoquerieInstance, options: CreateSnapshotOptions) {
  const user = await getCurrentUser()
  const storage = await getSnapshotStorage(mq)

  const snapshotItem: DatabaseSnapshot = {
    id: options.id,
    location: options.location,
    description: options.description,
    tags: options.tags,
    date: new Date(),
    author: user,
  }

  await storage.save(snapshotItem, options.location)

  const ctx = await mq.getResolvedContext()
  let resourceIds = options.resources

  // Select all resources
  if (!resourceIds) {
    resourceIds = {}
    for (const resourceName in ctx.schema.types) {
      const resourceStorage = await getResourceInstanceStorage(mq, resourceName)
      const ids = Object.keys(resourceStorage.manifest.files)
      resourceIds[resourceName] = ids
    }
  }

  // Copy resources
  const snapshotFolder = await getSnapshotFolder(mq, snapshotItem)
  if (!mq.data.skipWrites) {
    await ensureDir(snapshotFolder)
  }

  for (const resourceName in resourceIds) {
    const ids = resourceIds[resourceName]
    if (ids.length) {
      const data: { [id: string]: any } = {}
      const sourceFolder = path.join(getCurrentBranchFolder(mq), resourceName)
      const targetFile = path.join(snapshotFolder, `${resourceName}.res.json`)

      const resourceStorage = await getResourceInstanceStorage(mq, resourceName)

      for (const id of ids) {
        const file = resourceStorage.manifest.files[id]
        const sourceFile = path.join(sourceFolder, file)
        const content = await fs.promises.readFile(sourceFile, 'utf8')
        data[id] = SuperJSON.parse(content)
      }

      // Sort by key to ensure consistent order
      const sortedData = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)))
      await fs.promises.writeFile(targetFile, JSON.stringify(SuperJSON.serialize(sortedData), null, 2), 'utf8')
    }
  }

  return snapshotItem
}
