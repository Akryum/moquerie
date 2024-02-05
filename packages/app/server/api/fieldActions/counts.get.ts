export default defineEventHandler(async () => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const actions = ctx.fieldActions.items.map(fa => ({
    resourceName: fa.resourceName,
    fieldName: fa.fieldName,
    file: fa.file,
  }))

  const result: Record<string, number> = {}

  for (const key in ctx.schema.types) {
    result[key] = 0
  }

  for (const action of actions) {
    result[action.resourceName]++
  }

  return result
})
