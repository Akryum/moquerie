<script lang="ts" setup>
import { useRouteQuery } from '@vueuse/router'
import LinkList from '../LinkList.vue'
import type { DBLocation } from '~/types/db.js'
import type { ResourceFactory } from '~/types/factory.js'

// Location

const location = useRouteQuery<DBLocation>('factoryLocation', 'local')

const linkList = ref<InstanceType<typeof LinkList> | null>(null)

function onClickOnLocationButton() {
  linkList.value?.focusFilterInput()
}

// Factories

const route = useRoute()

const resourceName = computed(() => route.params.resourceName)

const factoryStore = useFactoryStore()

watchEffect(() => {
  factoryStore.fetchFactories({
    resourceName: resourceName.value as string,
    location: location.value,
  })
})

// Filter

function filter(item: ResourceFactory, filterValue: string) {
  return item.name.toLowerCase().includes(filterValue)
    || item.tags.some(tag => tag.toLowerCase().includes(filterValue))
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
    @open="onOpen"
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
          },
          {
            value: 'repository',
            label: 'Repository',
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
