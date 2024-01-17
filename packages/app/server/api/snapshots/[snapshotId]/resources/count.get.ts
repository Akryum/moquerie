import { getSnapshotStorage, readSnapshotResourceIds } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { snapshotId } = getRouterParams(event)
  const storage = await getSnapshotStorage()
  const snapshot = await storage.findById(snapshotId)
  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} not found`)
  }
  const ids = await readSnapshotResourceIds(snapshot)
  const result: Record<string, number> = {}
  for (const resourceName in ids) {
    result[resourceName] = ids[resourceName].length
  }
  return result
})
