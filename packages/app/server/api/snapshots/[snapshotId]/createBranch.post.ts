import { createBranchFromSnapshot, getSnapshotStorage } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { snapshotId } = getRouterParams(event)
  const { branchName } = await readBody(event)

  const storage = await getSnapshotStorage()
  const snapshot = await storage.findById(snapshotId)

  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} not found`)
  }

  await createBranchFromSnapshot({
    snapshot,
    branchName,
  })
})
