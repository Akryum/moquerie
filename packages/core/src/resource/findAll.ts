import type { FilterActive } from '../types/resource.js'
import { getResourceInstanceStorage } from './storage.js'

export interface FindAllResourceInstancesOptions {
  /**
   * By default only active instances are returned.
   */
  filterActive?: FilterActive
}

export async function findAllResourceInstances(resourceTypeName: string, options: FindAllResourceInstancesOptions = {}) {
  const storage = await getResourceInstanceStorage(resourceTypeName)
  const instances = await storage.findAll()

  if (!options.filterActive || options.filterActive === 'active') {
    return instances.filter(instance => instance.active)
  }
  else if (options.filterActive === 'inactive') {
    return instances.filter(instance => !instance.active)
  }
  else {
    return instances
  }
}
