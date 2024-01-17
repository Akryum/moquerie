<script lang="ts" setup>
import type { ResourceSchemaType } from '@moquerie/core'
import { useResourceTypeStore } from '~/stores/resourceType.js'

const props = defineProps<{
  routeName?: string
  resourceName?: string
  filterList?: (types: ResourceSchemaType[]) => ResourceSchemaType[]
}>()

const emit = defineEmits<{
  'update:resourceName': [resourceName: string]
}>()

const resourceTypeStore = useResourceTypeStore()

function filter(type: ResourceSchemaType, filterValue: string) {
  return type.name.toLowerCase().includes(filterValue)
    || type.tags.some(tag => tag.toLowerCase().includes(filterValue))
}

const router = useRouter()

function openResource(resource: ResourceSchemaType) {
  emit('update:resourceName', resource.name)

  if (props.routeName) {
    router.push({
      name: props.routeName,
      params: {
        resourceName: resource.name,
      },
    })
  }
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
    :items="filterList ? filterList(resourceTypeStore.resourceTypesShownInExplorer) : resourceTypeStore.resourceTypesShownInExplorer"
    :filter="filter"
    :selected-item="(type, route) => resourceName !== undefined ? type.name === resourceName : type.name === route.params.resourceName"
    filter-placeholder="Filter resources by name, tags..."
    :ui="{
      input: {
        trailing: { padding: { xs: 'pe-16' } },
      },
    }"
    class="p-2"
    @select="openResource"
  >
    <template #default="{ item, ...props }">
      <ResourceListItem
        :resource-type="item"
        :route-name="routeName"
        v-bind="props"
        @click="$emit('update:resourceName', item.name)"
      >
        <template #trailing>
          <slot name="item-trailing" :item="item" />
        </template>
      </ResourceListItem>
    </template>

    <template #trailing>
      <KbShortcut keys="meta_e" />
    </template>
  </LinkList>
</template>
