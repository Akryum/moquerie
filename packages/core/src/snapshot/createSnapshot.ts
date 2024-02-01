import fs from 'node:fs'
import path from 'pathe'
import type { DBLocation } from '../types/db.js'
import { getCurrentUser } from '../user/getCurrentUser.js'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { ensureDir } from '../util/fs.js'
import { getCurrentBranchFolder } from '../resource/branch.js'
import { getResourceInstanceStorage } from '../resource/storage.js'
import type { MoquerieInstance } from '../instance.js'
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
  for (const resourceName in resourceIds) {
    const sourceFolder = path.join(getCurrentBranchFolder(mq), resourceName)
    const targetFolder = path.join(snapshotFolder, resourceName)
    await ensureDir(targetFolder)

    const resourceStorage = await getResourceInstanceStorage(mq, resourceName)

    const ids = resourceIds[resourceName]
    for (const id of ids) {
      const file = resourceStorage.manifest.files[id]
      const sourceFile = path.join(sourceFolder, file)
      const targetFile = path.join(targetFolder, `${id}.json`)
      await fs.promises.copyFile(sourceFile, targetFile)
    }
  }

  return snapshotItem
}
