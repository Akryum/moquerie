import fs from 'node:fs'
import path from 'pathe'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { getSnapshotFolder } from './folder.js'

export interface RemoveResourcesToSnapshotOptions {
  snapshot: DatabaseSnapshot
  resourceIds: { [resourceName: string]: string[] }
}

export async function removeResourcesFromSnapshot(options: RemoveResourcesToSnapshotOptions) {
  const { snapshot, resourceIds } = options

  // Delete resources
  const snapshotFolder = await getSnapshotFolder(snapshot)
  for (const resourceName in resourceIds) {
    const targetFolder = path.join(snapshotFolder, resourceName)
    const ids = resourceIds[resourceName]
    for (const id of ids) {
      const targetFile = path.join(targetFolder, `${id}.json`)
      if (fs.existsSync(targetFile)) {
        await fs.promises.rm(targetFile)
      }
    }
  }
}
