import SuperJSON from 'superjson'
import { createResourceInstance, getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const { resourceName, value, comment, tags } = await readBody(event)
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource type not found: ${resourceName}`)
  }

  const instance = await createResourceInstance(mq, {
    resourceName,
    value,
    comment,
    tags,
    save: true,
  })

  return SuperJSON.stringify(instance)
})
