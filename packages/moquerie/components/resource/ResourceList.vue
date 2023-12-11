<script lang="ts" setup>
import { useResourceTypeStore } from '~/stores/resourceType.js'
import type { ResourceSchemaType } from '~/types/resource.js'

const props = defineProps<{
  routeName: string
}>()

const resourceTypeStore = useResourceTypeStore()

function filter(type: ResourceSchemaType, filterValue: string) {
  return type.name.toLowerCase().includes(filterValue)
    || type.tags.some(tag => tag.toLowerCase().includes(filterValue))
}

// type.name === route.params.name

const router = useRouter()

function openResource(resource: ResourceSchemaType) {
  router.push({
    name: props.routeName,
    params: {
      resourceName: resource.name,
    },
  })
}
</script>

<template>
  <LinkList
    id="resource-list"
    :items="resourceTypeStore.resourceTypes"
    :filter="filter"
    :selected-item="(type, route) => type.name === route.params.resourceName"
    filter-placeholder="Filter resources by name, tags..."
    @open="openResource"
  >
    <template #default="{ item, ...props }">
      <ResourceListItem
        :resource-type="item"
        :route-name="routeName"
        v-bind="props"
      />
    </template>
  </LinkList>
</template>
