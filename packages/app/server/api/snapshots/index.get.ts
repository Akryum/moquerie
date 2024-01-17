import type { DBLocation, DatabaseSnapshot } from '@moquerie/core'
import { getSnapshotStorage } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler<{ query: { location?: DBLocation }, body: DatabaseSnapshot[] }>(async (event) => {
  const { location } = await getQuery(event)
  const storage = await getSnapshotStorage()
  let snapshots = await storage.findAll()
  if (location) {
    snapshots = snapshots.filter(s => s.location === location)
  }
  snapshots.sort((a, b) => b.date.getTime() - a.date.getTime())
  return SuperJSON.stringify(snapshots)
})
