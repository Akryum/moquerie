import type { ResourceSchema, ResourceSchemaType } from '@moquerie/core'
import SuperJSON from 'superjson'

export const useResourceTypeStore = defineStore('resourceTypes', () => {
  const fetchQuery = useFetch<ResourceSchema>('/api/resources', {
    transform: (data: any) => SuperJSON.parse<ResourceSchema>(data),
  })
  const { data, refresh } = fetchQuery
  onWindowFocus(refresh)

  const resourceTypes = computed(() => {
    if (!data.value) {
      return []
    }

    return Object.values(data.value.types)
  })

  const resourceTypesShownInExplorer = computed(() => {
    if (data.value?.ignoredInExplorer) {
      return resourceTypes.value.filter((type) => {
        return !data.value?.ignoredInExplorer?.some((filter) => {
          if (typeof filter === 'string') {
            return filter === type.name
          }
          else if (filter instanceof RegExp) {
            return filter.test(type.name)
          }
          return false
        })
      })
    }
    return resourceTypes.value
  })

  /**
   * Wait for resource types to be loaded.
   */
  async function wait() {
    await fetchQuery
  }

  // Last selected resourceName

  const lastSelectedResourceName = ref<string | undefined>(undefined)

  const router = useRouter()

  watch(router.currentRoute, (route) => {
    const resourceName = route.params.resourceName as string | undefined
    if (resourceName) {
      lastSelectedResourceName.value = resourceName
    }
  }, {
    deep: true,
    immediate: true,
  })

  // Fetch single type

  const resourceType = ref<ResourceSchemaType | undefined>()

  let lastFetchResourceType: string | undefined

  async function fetchResourceType(resourceName: string) {
    lastFetchResourceType = resourceName

    const data = (await $fetch(`/api/resources/${resourceName}`)) as ResourceSchemaType
    resourceType.value = data
    return resourceType
  }

  async function refreshResourceType() {
    if (!lastFetchResourceType) {
      return
    }

    await fetchResourceType(lastFetchResourceType)
  }

  onWindowFocus(refreshResourceType)

  return {
    resourceTypes,
    resourceTypesShownInExplorer,
    refresh,
    wait,
    lastSelectedResourceName,
    fetchResourceType,
    refreshResourceType,
  }
})
