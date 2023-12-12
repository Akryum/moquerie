import { getResourceInstanceStorage } from './storage.js'

export interface FindAllResourceInstancesOptions {
  /**
   * By default only active instances are returned.
   */
  activeFilter?: 'active' | 'inactive' | 'all'
}

export async function findAllResourceInstances(resourceTypeName: string, options: FindAllResourceInstancesOptions = {}) {
  const storage = await getResourceInstanceStorage(resourceTypeName)
  const instances = await storage.findAll()

  if (!options.activeFilter || options.activeFilter === 'active') {
    return instances.filter(instance => instance.active)
  }
  else if (options.activeFilter === 'inactive') {
    return instances.filter(instance => !instance.active)
  }
  else {
    return instances
  }
}
