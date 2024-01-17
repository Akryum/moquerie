import { deleteSnapshot } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { snapshotId } = getRouterParams(event)
  await deleteSnapshot(snapshotId)
})
