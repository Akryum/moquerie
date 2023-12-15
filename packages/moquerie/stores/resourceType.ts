import type { ResourceSchemaType } from '~/types/resource.js'

export const useResourceTypeStore = defineStore('resourceTypes', () => {
  const fetchQuery = useFetch('/api/resources')
  const { data, refresh } = fetchQuery
  onWindowFocus(refresh)

  const resourceTypes = computed(() => {
    if (!data.value) {
      return []
    }

    return Object.values(data.value.types)
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
    refresh,
    wait,
    lastSelectedResourceName,
    fetchResourceType,
    refreshResourceType,
  }
})
