import type { FilterActive, ResourceInstance } from '@moquerie/core'
import SuperJSON from 'superjson'

export interface FetchInstancesOptions {
  resourceName: string
  filterActive?: FilterActive
  searchText?: string
}

export interface FetchInstanceOptions {
  resourceName: string
  instanceId: string
}

export interface UpdateInstanceOptions {
  resourceName: string
  instanceId: string
  data: Partial<ResourceInstance>
  refetchAll?: boolean
}

export interface BulkUpdateInstancesOptions {
  resourceName: string
  instanceIds: string[]
  data: Partial<ResourceInstance>
}

export const useResourceInstanceStore = defineStore('resourceInstance', () => {
  const instances = ref<ResourceInstance[]>([])

  let lastFetchInstancesOptions: FetchInstancesOptions | null = null

  async function fetchInstances(options: FetchInstancesOptions) {
    lastFetchInstancesOptions = options

    const { resourceName, ...query } = options

    instances.value = SuperJSON.parse(await $fetch(`/api/resources/instances/${resourceName}`, {
      query,
    }))
    return instances
  }

  async function refreshInstances() {
    if (lastFetchInstancesOptions) {
      return fetchInstances(lastFetchInstancesOptions)
    }
  }

  onWindowFocus(refreshInstances)

  function updateInList(result: ResourceInstance) {
    if (result.resourceName !== lastFetchInstancesOptions?.resourceName) {
      return
    }

    const shouldBeInList = (lastFetchInstancesOptions?.filterActive === 'active' && result.active)
      || (lastFetchInstancesOptions?.filterActive === 'inactive' && !result.active)
      || lastFetchInstancesOptions?.filterActive === 'all'
    const index = instances.value.findIndex(instance => instance.id === result.id)
    if (index !== -1) {
      if (!shouldBeInList) {
        instances.value.splice(index, 1)
      }
      else {
        instances.value[index] = result
      }
    }
    else {
      // We don't know position in list so we refetch
      refreshInstances()
    }
  }

  // Single instance

  const instance = ref<ResourceInstance | null>(null)

  let lastFetchInstanceOptions: FetchInstanceOptions | null = null

  async function fetchInstance(options: FetchInstanceOptions) {
    lastFetchInstanceOptions = options

    const { resourceName, instanceId } = options

    const result = instance.value = SuperJSON.parse(await $fetch(`/api/resources/instances/${resourceName}/${instanceId}`))

    // Update in list
    if (result) {
      updateInList(result)
    }

    return instance
  }

  async function refreshInstance() {
    if (lastFetchInstanceOptions) {
      return fetchInstance(lastFetchInstanceOptions)
    }
  }

  onWindowFocus(refreshInstance)

  // Update instance

  async function updateInstance(options: UpdateInstanceOptions) {
    const result = await $fetch(`/api/resources/instances/${options.resourceName}/${options.instanceId}`, {
      method: 'PATCH',
      body: options.data,
    })
    const data = SuperJSON.parse(result as string) as ResourceInstance
    if (options.refetchAll) {
      refreshInstances()
      refreshInstance()
    }
    else {
      updateInList(data)
    }
    instance.value = data
    return data
  }

  async function bulkUpdateInstances(options: BulkUpdateInstancesOptions) {
    await $fetch(`/api/resources/instances/${options.resourceName}/bulk`, {
      method: 'PATCH',
      body: {
        ids: options.instanceIds,
        data: options.data,
      },
    })
    refreshInstances()
    refreshInstance()
  }

  // Duplicate instance

  async function duplicateInstances(resourceName: string, ids: string[]) {
    const result = SuperJSON.parse(await $fetch(`/api/resources/instances/${resourceName}/duplicate`, {
      method: 'POST',
      body: {
        ids,
      },
    })) as ResourceInstance[]
    refreshInstances()
    return result
  }

  // Delete instances

  async function deleteInstances(resourceName: string, ids: string[]) {
    await $fetch(`/api/resources/instances/${resourceName}/bulk`, {
      method: 'DELETE',
      body: {
        ids,
      },
    })
    await refreshInstances()
  }

  return {
    instances,
    fetchInstances,
    refreshInstances,
    instance,
    fetchInstance,
    refreshInstance,
    updateInstance,
    bulkUpdateInstances,
    duplicateInstances,
    deleteInstances,
  }
})
