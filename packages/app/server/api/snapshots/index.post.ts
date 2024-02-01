import { createSnapshot, getSnapshotStorage } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { id, location, description, tags, resources } = await readBody(event)

  const storage = await getSnapshotStorage(mq)
  if (await storage.findById(id)) {
    throw new Error(`Snapshot with id "${id}" already exists`)
  }

  const snapshot = await createSnapshot(mq, {
    id,
    location,
    description,
    tags,
    resources,
  })
  return SuperJSON.stringify(snapshot)
})
