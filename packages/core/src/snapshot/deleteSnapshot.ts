import fs from 'node:fs'
import type { MoquerieInstance } from '../instance.js'
import { getSnapshotFolder } from './folder.js'
import { getSnapshotStorage } from './storage.js'

export async function deleteSnapshot(mq: MoquerieInstance, id: string) {
  const storage = await getSnapshotStorage(mq)
  const snapshot = await storage.findById(id)
  if (!snapshot) {
    throw new Error(`Snapshot ${id} not found`)
  }

  await storage.remove(snapshot.id)

  const snapshotFolder = await getSnapshotFolder(mq, snapshot)
  await fs.promises.rm(snapshotFolder, {
    recursive: true,
  })
}
