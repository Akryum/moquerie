import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { resourceName, getCode } = getQuery(event)

  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  let result = ctx.fieldActions.allActions.map(fa => ({
    resourceName: fa.resourceName,
    fieldName: fa.fieldName,
    file: fa.file,
    code: getCode ? fa.action.toString() : undefined,
  }))

  if (resourceName) {
    result = result.filter(r => Array.isArray(resourceName) ? resourceName.includes(r.resourceName) : r.resourceName === resourceName)
  }

  return result
})
