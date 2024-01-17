import fs from 'node:fs'
import { getSnapshotFolder } from './folder.js'
import { getSnapshotStorage } from './storage.js'

export async function deleteSnapshot(id: string) {
  const storage = await getSnapshotStorage()
  const snapshot = await storage.findById(id)
  if (!snapshot) {
    throw new Error(`Snapshot ${id} not found`)
  }

  await storage.remove(snapshot.id)

  const snapshotFolder = await getSnapshotFolder(snapshot)
  await fs.promises.rm(snapshotFolder, {
    recursive: true,
  })
}
