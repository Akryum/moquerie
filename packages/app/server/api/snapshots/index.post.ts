import { createSnapshot, getSnapshotStorage } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const { id, location, description, tags, resources } = await readBody(event)

  const storage = await getSnapshotStorage()
  if (await storage.findById(id)) {
    throw new Error(`Snapshot with id "${id}" already exists`)
  }

  const snapshot = await createSnapshot({
    id,
    location,
    description,
    tags,
    resources,
  })
  return SuperJSON.stringify(snapshot)
})
