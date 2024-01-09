import SuperJSON from 'superjson'
import { findAllResourceInstances, isResourceInstanceReference } from '@moquerie/core'

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

  list = list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return SuperJSON.stringify(list)
})

function searchInValue(reg: RegExp, value: any): boolean {
  if (Array.isArray(value)) {
    return value.some(item => searchInValue(reg, item))
  }
  else if (typeof value === 'string') {
    return !!value.match(reg)
  }
  else if (value && typeof value === 'object') {
    if (isResourceInstanceReference(value)) {
      return false
    }
    for (const key in value) {
      if (searchInValue(reg, value[key])) {
        return true
      }
    }
  }
  return false
}
