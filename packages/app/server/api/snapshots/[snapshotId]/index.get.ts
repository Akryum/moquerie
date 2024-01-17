import { getSnapshotStorage } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const { snapshotId } = getRouterParams(event)
  const storage = await getSnapshotStorage()
  const snapshot = await storage.findById(snapshotId)
  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} not found`)
  }
  return SuperJSON.stringify(snapshot)
})
