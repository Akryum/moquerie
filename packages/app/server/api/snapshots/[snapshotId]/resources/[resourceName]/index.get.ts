import type { FilterActive } from '@moquerie/core'
import { getSnapshotStorage, readSnapshotResources } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { snapshotId, resourceName } = getRouterParams(event)
  const { filterActive, searchText } = getQuery(event) as { filterActive: FilterActive, searchText: string }
  const storage = await getSnapshotStorage(mq)
  const snapshot = await storage.findById(snapshotId)
  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} not found`)
  }
  let list = await readSnapshotResources(mq, snapshot, resourceName)

  if (filterActive && filterActive !== 'all') {
    list = list.filter((instance) => {
      if (filterActive === 'active') {
        return instance.active
      }
      else if (filterActive === 'inactive') {
        return !instance.active
      }
      return true
    })
  }

  if (searchText) {
    const reg = new RegExp(searchText, 'i')
    list = list.filter(i => i.comment?.match(reg) || i.tags.some(tag => tag.match(reg)) || searchInValue(reg, i.value))
  }

  // Max 100 items
  // @TODO pagination
  if (list.length > 100) {
    list = list.slice(0, 100)
  }

  list = list.sort((a, b) => {
    const timeA = a.createdAt.getTime()
    const timeB = b.createdAt.getTime()
    if (timeA === timeB) {
      return a.id.localeCompare(b.id)
    }
    return timeB - timeA
  })

  return SuperJSON.stringify(list)
})
