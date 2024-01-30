import SuperJSON from 'superjson'
import { createResourceInstance, getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const ctx = await getResolvedContext()
  const { resourceName, value, comment, tags } = await readBody(event)
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource type not found: ${resourceName}`)
  }

  const instance = await createResourceInstance({
    resourceName,
    value,
    comment,
    tags,
    save: true,
  })

  return SuperJSON.stringify(instance)
})
