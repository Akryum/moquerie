<script lang="ts" setup>
import type { DBLocation, ResourceFactory } from '@moquerie/core'
import { useRouteQuery } from '@vueuse/router'

const route = useRoute()

const resourceName = computed(() => String(route.params.resourceName))

// Location

const location = useRouteQuery<DBLocation>('factoryLocation', 'local')

// @TODO type with component
const linkList = ref<any>(null)

function onClickOnLocationButton() {
  linkList.value?.focusFilterInput()
}

// Count

const { data: counts, refresh: refreshCounts } = await useFetch('/api/factories/count', {
  query: {
    resourceName,
  },
})
onWindowFocus(refreshCounts)

// Factories

const factoryStore = useFactoryStore()

watchEffect(() => {
  factoryStore.fetchFactories({
    resourceName: resourceName.value,
    location: location.value,
  })
})

// Filter

function filter(factory: ResourceFactory, filterValue: string): boolean {
  return factory.name.toLowerCase().includes(filterValue)
    || factory.info.tags.some(tag => tag.toLowerCase().includes(filterValue))
    || factory.info.description?.toLowerCase().includes(filterValue)
    || false
}

// Open

const router = useRouter()

function onOpen(factory: ResourceFactory) {
  router.push({
    name: 'db-factories-resourceName-view-factoryId',
    params: {
      ...route.params,
      factoryId: factory.id,
    },
    query: {
      ...route.query,
    },
  })
}
</script>

<template>
  <LinkList
    id="factory-list"
    ref="linkList"
    :items="factoryStore.factories"
    :filter="filter"
    :selected-item="(factory, route) => factory.id === route.params.factoryId"
    filter-placeholder="Filter factories by name, tags..."
    class="p-2"
    @select="onOpen"
  >
    <template #toolbar>
      <RadioButtonGroup
        v-model="location"
        :button-attrs="{
          color: 'gray',
          size: 'xs',
          block: true,
        }"
        :options="[
          {
            value: 'local',
            label: 'Local',
            count: counts?.local,
          },
          {
            value: 'repository',
            label: 'Repository',
            count: counts?.repository,
          },
        ]"
        @update:model-value="onClickOnLocationButton()"
      />
    </template>

    <template #default="{ item, ...props }">
      <FactoryListItem
        :factory="item"
        v-bind="props"
      />
    </template>
  </LinkList>
</template>
