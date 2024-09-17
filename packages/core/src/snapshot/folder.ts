import path from 'pathe'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import type { MoquerieInstance } from '../instance.js'
import { getSnapshotStorage } from './storage.js'

export async function getSnapshotFolder(mq: MoquerieInstance, snapshot: Pick<DatabaseSnapshot, 'id' | 'location'>) {
  const storage = await getSnapshotStorage(mq)
  return path.join(storage[snapshot.location].folder, snapshot.id)
}
