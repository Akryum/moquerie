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

  return {
    resourceTypes,
    refresh,
    wait,
    lastSelectedResourceName,
  }
})
