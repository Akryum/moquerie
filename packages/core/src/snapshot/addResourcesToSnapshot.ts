import fs from 'node:fs'
import path from 'pathe'
import SuperJSON from 'superjson'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { getCurrentBranchFolder } from '../resource/branch.js'
import { getResourceInstanceStorage } from '../resource/storage.js'
import type { MoquerieInstance } from '../instance.js'
import { getSnapshotFolder } from './folder.js'
import { migrateSnapshotFolder } from './migrate.js'

export interface AddResourcesToSnapshotOptions {
  snapshot: DatabaseSnapshot
  resourceIds: { [resourceName: string]: string[] }
}

export async function addResourcesToSnapshot(mq: MoquerieInstance, options: AddResourcesToSnapshotOptions) {
  const { snapshot, resourceIds } = options

  const snapshotFolder = await getSnapshotFolder(mq, snapshot)

  await migrateSnapshotFolder(snapshotFolder)

  for (const resourceName in resourceIds) {
    const sourceFolder = path.join(getCurrentBranchFolder(mq), resourceName)

    const targetFile = path.join(snapshotFolder, `${resourceName}.res.json`)

    const resourceStorage = await getResourceInstanceStorage(mq, resourceName)

    const ids = resourceIds[resourceName]
    const data: Record<string, any> = SuperJSON.parse(await fs.promises.readFile(targetFile, 'utf8'))

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
