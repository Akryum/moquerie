import { deleteSnapshot } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { snapshotId } = getRouterParams(event)
  await deleteSnapshot(mq, snapshotId)
})
