import { getSnapshotStorage } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const { id, location, description, tags } = await readBody(event)
  const storage = await getSnapshotStorage()
  const snapshot = await storage.findById(id)
  if (!snapshot) {
    throw new Error(`Snapshot ${id} not found`)
  }
  Object.assign(snapshot, {
    location,
    description,
    tags,
  })
  await storage.save(snapshot)
  return SuperJSON.stringify(snapshot)
})
