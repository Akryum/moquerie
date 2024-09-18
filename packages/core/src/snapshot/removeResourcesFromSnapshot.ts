import fs from 'node:fs'
import path from 'pathe'
import SuperJSON from 'superjson'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import type { MoquerieInstance } from '../instance.js'
import { getSnapshotFolder } from './folder.js'
import { migrateSnapshotFolder } from './migrate.js'

export interface RemoveResourcesToSnapshotOptions {
  snapshot: DatabaseSnapshot
  resourceIds: { [resourceName: string]: string[] }
}

export async function removeResourcesFromSnapshot(mq: MoquerieInstance, options: RemoveResourcesToSnapshotOptions) {
  const { snapshot, resourceIds } = options

  if (mq.data.skipWrites) {
    throw new Error('Cannot remove resources from a snapshot in read-only mode')
  }

  // Delete resources
  const snapshotFolder = await getSnapshotFolder(mq, snapshot)
  await migrateSnapshotFolder(mq, snapshotFolder)

  for (const resourceName in resourceIds) {
    const ids = resourceIds[resourceName]
    const targetFile = path.join(snapshotFolder, `${resourceName}.res.json`)
    if (fs.existsSync(targetFile)) {
      // New format with each resource type in a single file
      const content = await fs.promises.readFile(targetFile, 'utf-8')
      const data = SuperJSON.parse<any>(content)
      for (const id of ids) {
        delete data[id]
      }
      if (Object.keys(data).length === 0) {
        await fs.promises.rm(targetFile)
      }
      else {
        await fs.promises.writeFile(targetFile, JSON.stringify(SuperJSON.serialize(data), null, 2), 'utf-8')
      }
    }
  }
}
