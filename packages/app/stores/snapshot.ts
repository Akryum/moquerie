import type { DBLocation, DatabaseSnapshot } from '@moquerie/core'
import SuperJSON from 'superjson'

export interface FetchSnapshotsOptions {
  location?: DBLocation
}

export const useSnapshotStore = defineStore('snapshots', () => {
  // Count

  const { data: counts, refresh: refreshCounts } = useFetch('/api/snapshots/count', {
    default: () => ({
      local: 0,
      repository: 0,
    }),
  })

  // Fetch many

  const snapshots = ref<DatabaseSnapshot[]>([])

  let lastFetchOptions: FetchSnapshotsOptions | null = null

  async function fetchSnapshots(options: FetchSnapshotsOptions = {}) {
    lastFetchOptions = options
    return snapshots.value = SuperJSON.parse(await $fetch('/api/snapshots', {
      query: options,
    }))
  }

  async function refreshSnapshots() {
    if (lastFetchOptions) {
      await fetchSnapshots(lastFetchOptions)
    }
    await refreshCounts()
  }

  onWindowFocus(refreshSnapshots)

  // Fetch one

  let lastSnapshotId: string | null = null

  const snapshot = ref<DatabaseSnapshot | null>(null)

  async function fetchSnapshot(id: string) {
    lastSnapshotId = id
    snapshot.value = SuperJSON.parse(await $fetch(`/api/snapshots/${id}`))
    return snapshot
  }

  async function refreshSnapshot() {
    if (lastSnapshotId) {
      await fetchSnapshot(lastSnapshotId)
    }
  }

  onWindowFocus(refreshSnapshot)

  // Delete

  async function deleteSnapshot(id: string) {
    await $fetch(`/api/snapshots/${id}`, {
      method: 'DELETE',
    })
    await refreshSnapshots()
  }

  return {
    snapshots,
    counts,
    fetchSnapshots,
    refreshSnapshots,
    snapshot,
    fetchSnapshot,
    refreshSnapshot,
    deleteSnapshot,
  }
})
