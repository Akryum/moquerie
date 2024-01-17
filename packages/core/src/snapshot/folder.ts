import path from 'pathe'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { getSnapshotStorage } from './storage.js'

export async function getSnapshotFolder(snapshot: DatabaseSnapshot) {
  const storage = await getSnapshotStorage()
  return path.join(storage[snapshot.location].folder, snapshot.id)
}
