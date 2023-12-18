import SuperJSON from 'superjson'
import { createContext } from '~/lib/context.js'
import { getResourceSchema } from '~/lib/resource.js'
import { createInstance } from '~/lib/resource/createInstance.js'

export default defineEventHandler(async (event) => {
  const ctx = await createContext()
  const schema = await getResourceSchema(ctx)
  const { resourceName, value } = await readBody(event)
  const resourceType = schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource type not found: ${resourceName}`)
  }

  const instance = await createInstance({
    resourceName,
    value,
  })

  return SuperJSON.stringify(instance)
})
