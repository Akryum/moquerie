import { generateResourceInstances, getFactoryStorage, getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const ctx = await getResolvedContext()
  const { resourceName, factoryId, count } = await readBody(event)
  const resourceType = ctx.schema.types[resourceName]
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
