import type { DBLocation, ResourceFactory } from '@moquerie/core'
import SuperJSON from 'superjson'

export const useFactoryStore = defineStore('factories', () => {
  const factories = ref<ResourceFactory[]>([])

  // Fetch many

  let lastFetchOptions: { resourceName?: string, location?: DBLocation } = {}

  async function fetchFactories(options: { resourceName?: string, location?: DBLocation } = {}) {
    lastFetchOptions = options
    return factories.value = SuperJSON.parse(await $fetch('/api/factories', {
      query: options,
    }))
  }

  async function refreshFactories() {
    await fetchFactories(lastFetchOptions)
  }

  onWindowFocus(refreshFactories)

  // Fetch one

  async function fetchFactory(id: string) {
    const factory = SuperJSON.parse<ResourceFactory>(await $fetch(`/api/factories/${id}`))

    // Update in query cache
    const item = factories.value.find(i => i.id === id)
    if (item) {
      Object.assign(item, factory)
    }

    return factory
  }

  return {
    factories,
    fetchFactories,
    refreshFactories,
    fetchFactory,
  }
})
