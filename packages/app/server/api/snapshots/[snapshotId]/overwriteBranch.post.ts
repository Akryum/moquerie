import { getSnapshotStorage, overwriteCurrentBranchWithSnapshot } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { snapshotId } = getRouterParams(event)

  const storage = await getSnapshotStorage(mq)
  const snapshot = await storage.findById(snapshotId)

  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} not found`)
  }

  await overwriteCurrentBranchWithSnapshot(mq, {
    snapshot,
  })
})
