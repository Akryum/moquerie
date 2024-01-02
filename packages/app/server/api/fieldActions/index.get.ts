import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { resourceName } = getQuery(event)

  const ctx = await getResolvedContext()
  let result = ctx.fieldActions.allActions.map(fa => ({
    resourceName: fa.resourceType.name,
    fieldName: fa.field.name,
    file: fa.file,
  }))

  if (resourceName) {
    result = result.filter(r => Array.isArray(resourceName) ? resourceName.includes(r.resourceName) : r.resourceName === resourceName)
  }

  return result
})
