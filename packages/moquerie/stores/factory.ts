import SuperJSON from 'superjson'
import type { DBLocation } from '~/types/db.js'
import type { ResourceFactory } from '~/types/factory.js'

export const useFactoryStore = defineStore('factories', () => {
  const factories = ref<ResourceFactory[]>([])

  let lastFetchOptions: { resourceName?: string, location?: DBLocation } = {}

  async function fetchFactories(options: { resourceName?: string, location?: DBLocation } = {}) {
    lastFetchOptions = options
    factories.value = SuperJSON.parse(await $fetch('/api/factories', {
      query: options,
    }))
  }

  async function refresh() {
    await fetchFactories(lastFetchOptions)
  }

  onWindowFocus(refresh)

  return {
    factories,
    fetchFactories,
    refresh,
  }
})
