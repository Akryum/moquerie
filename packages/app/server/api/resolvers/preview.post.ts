import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const {
    resourceName,
    instanceId,
    fieldName,
  } = await readBody(event)

  const mq = getMq()
  const ctx = await mq.getResolvedContext()

  const fieldAction = ctx.resolvers.items.find(fa => fa.resourceName === resourceName && fa.fieldName === fieldName)
    ?? ctx.fieldActions.items.find(fa => fa.resourceName === resourceName && fa.fieldName === fieldName)
  if (!fieldAction) {
    throw new Error(`Field action not found for resource ${resourceName} and field ${fieldName}`)
  }

  const instance = await ctx.db[String(resourceName)].findByInstanceIdOrThrow(String(instanceId))

  return fieldAction.action({
    parent: instance,
    input: {},
    db: ctx.db,
    pubsub: ctx.pubSubs,
    generateId: nanoid,
  })
})
