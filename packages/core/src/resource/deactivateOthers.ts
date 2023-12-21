import { getResolvedContext } from '../context.js'
import { findAllResourceInstances } from './findAll.js'
import { updateResourceInstanceById } from './update.js'

export async function deactivateOtherResourceInstances(resourceName: string, id: string) {
  const instances = await findAllResourceInstances(resourceName, {
    filterActive: 'active',
  })
  const promises: Promise<any>[] = []
  for (const otherInstance of instances) {
    if (otherInstance.id !== id) {
      promises.push(updateResourceInstanceById(resourceName, otherInstance.id, {
        active: false,
      }))
    }
  }
  await Promise.all(promises)
}

export async function deactiveOtherSingletonResourceInstances(resourceName: string, id: string) {
  const ctx = await getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (resourceType && !resourceType.array) {
    await deactivateOtherResourceInstances(resourceName, id)
  }
}
