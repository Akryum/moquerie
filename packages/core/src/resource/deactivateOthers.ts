import type { MoquerieInstance } from '../instance.js'
import { findAllResourceInstances } from './findAll.js'
import { updateResourceInstanceById } from './update.js'

export async function deactivateOtherResourceInstances(mq: MoquerieInstance, resourceName: string, id: string) {
  const instances = await findAllResourceInstances(mq, resourceName, {
    filterActive: 'active',
  })
  const promises: Promise<any>[] = []
  for (const otherInstance of instances) {
    if (otherInstance.id !== id) {
      promises.push(updateResourceInstanceById(mq, resourceName, otherInstance.id, {
        active: false,
      }))
    }
  }
  await Promise.all(promises)
}

export async function deactiveOtherSingletonResourceInstances(mq: MoquerieInstance, resourceName: string, id: string) {
  const ctx = await mq.getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (resourceType && !resourceType.array) {
    await deactivateOtherResourceInstances(mq, resourceName, id)
  }
}
