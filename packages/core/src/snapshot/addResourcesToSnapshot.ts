import fs from 'node:fs'
import path from 'pathe'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { getCurrentBranchFolder } from '../resource/branch.js'
import { ensureDir } from '../util/fs.js'
import { getResourceInstanceStorage } from '../resource/storage.js'
import type { MoquerieInstance } from '../instance.js'
import { getSnapshotFolder } from './folder.js'

export interface AddResourcesToSnapshotOptions {
  snapshot: DatabaseSnapshot
  resourceIds: { [resourceName: string]: string[] }
}

export async function addResourcesToSnapshot(mq: MoquerieInstance, options: AddResourcesToSnapshotOptions) {
  const { snapshot, resourceIds } = options

  // Copy resources
  const snapshotFolder = await getSnapshotFolder(mq, snapshot)
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
}
