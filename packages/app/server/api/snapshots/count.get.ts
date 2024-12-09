import type { DBLocation } from '@moquerie/core'
import { getSnapshotStorage } from '@moquerie/core'

export default defineEventHandler(async () => {
  const mq = getMq()
  const storage = await getSnapshotStorage(mq)
  const snapshots = await storage.findAll()
  const result: Record<DBLocation, number> = {
    local: 0,
    repository: 0,
  }
  for (const snapshot of snapshots) {
    result[snapshot.location]++
  }
  return result
})
