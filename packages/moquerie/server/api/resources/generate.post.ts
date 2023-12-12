import { createContext } from '~/lib/context.js'
import { getFactoryStorage } from '~/lib/factory/storage.js'
import { getResourceSchema } from '~/lib/resource.js'
import { generateResourceInstances } from '~/lib/resource/generateInstances.js'

export default defineEventHandler(async (event) => {
  const ctx = await createContext()
  const schema = await getResourceSchema(ctx)
  const { resourceName, factoryId, count } = await readBody(event)
  const resourceType = schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource type not found: ${resourceName}`)
  }
  const factory = await (await getFactoryStorage()).findById(factoryId)
  if (!factory) {
    throw new Error(`Factory not found: ${factoryId}`)
  }
  if (factory.resourceName !== resourceName) {
    throw new Error(`Factory resource type mismatch: ${factory.resourceName} !== ${resourceName}`)
  }
  const instances = await generateResourceInstances({
    resourceType,
    factory,
    count,
  })
  return instances
})
