<script lang="ts" setup>
import { useResourceTypeStore } from '~/stores/resourceType.js'
import type { ResourceSchemaType } from '@moquerie/core'

const props = defineProps<{
  routeName: string
}>()

const resourceTypeStore = useResourceTypeStore()

function filter(type: ResourceSchemaType, filterValue: string) {
  return type.name.toLowerCase().includes(filterValue)
    || type.tags.some(tag => tag.toLowerCase().includes(filterValue))
}

const router = useRouter()

function openResource(resource: ResourceSchemaType) {
  router.push({
    name: props.routeName,
    params: {
      resourceName: resource.name,
    },
  })
}

// Shortcut

const linkList = ref<any>()

defineShortcuts({
  meta_e: {
    usingInput: true,
    handler: () => {
      linkList.value?.focusFilterInput()
    },
  },
})
</script>

<template>
  <LinkList
    id="resource-list"
    ref="linkList"
    :items="resourceTypeStore.resourceTypes"
    :filter="filter"
    :selected-item="(type, route) => type.name === route.params.resourceName"
    filter-placeholder="Filter resources by name, tags..."
    :ui="{
      input: {
        trailing: { padding: { xs: 'pe-16' } },
      },
    }"
    @open="openResource"
  >
    <template #default="{ item, ...props }">
      <ResourceListItem
        :resource-type="item"
        :route-name="routeName"
        v-bind="props"
      />
    </template>

    <template #trailing>
      <KbShortcut :keys="['meta', 'E']" />
    </template>
  </LinkList>
</template>
