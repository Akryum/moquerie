import { createDefaultFactoryFields, getResolvedContext } from '@moquerie/core'

export default defineEventHandler<{ query: { resourceName: string } }>(async (event) => {
  const { resourceName } = getQuery(event)
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource ${resourceName} not found`)
  }
  const fields = await createDefaultFactoryFields(mq, {
    resourceType,
  })
  return {
    fields,
  }
})
