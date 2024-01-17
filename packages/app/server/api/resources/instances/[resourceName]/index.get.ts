import SuperJSON from 'superjson'
import { findAllResourceInstances } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { resourceName } = getRouterParams(event)
  const { filterActive, searchText } = getQuery(event) as any

  let list = await findAllResourceInstances(resourceName, {
    filterActive,
  })

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
