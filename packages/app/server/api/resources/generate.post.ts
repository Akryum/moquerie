import { generateResourceInstances, getFactoryStorage } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const { resourceName, factoryId, count } = await readBody(event)
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource type not found: ${resourceName}`)
  }
  const factory = await (await getFactoryStorage(mq)).findById(factoryId)
  if (!factory) {
    throw new Error(`Factory not found: ${factoryId}`)
  }
  if (factory.resourceName !== resourceName) {
    throw new Error(`Factory resource type mismatch: ${factory.resourceName} !== ${resourceName}`)
  }
  const instances = await generateResourceInstances(mq, {
    resourceType,
    factory,
    count,
  })
  return instances
})
