import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const {
    resourceName,
    instanceId,
    fieldName,
  } = await readBody(event)

  const ctx = await getResolvedContext()

  const fieldAction = ctx.fieldActions.allActions.find(fa => fa.resourceType.name === resourceName && fa.field.name === fieldName)
  if (!fieldAction) {
    throw new Error(`Field action not found for resource ${resourceName} and field ${fieldName}`)
  }

  const instance = await ctx.db[String(resourceName)].findByInstanceIdOrThrow(String(instanceId))

  return fieldAction.action({
    parent: instance,
    input: {},
    db: ctx.db,
  })
})
