<script lang="ts" setup>
const { data, refresh } = await useFetch('/api/fieldActions/counts')
onWindowFocus(refresh)

interface Item {
  name: string
  count: number
}

const items = computed<Array<Item>>(() => {
  const result = []
  for (const resourceName in data.value) {
    result.push({
      name: resourceName,
      count: data.value[resourceName],
    })
  }
  return result
})

function filter(item: Item, filterValue: string) {
  return item.name.toLowerCase().includes(filterValue)
}

const router = useRouter()

function openResource(item: Item) {
  router.push({
    name: 'db-fieldActions-resourceName',
    params: {
      resourceName: item.name,
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
    id="field-action-resource-list"
    ref="linkList"
    :items="items"
    :filter="filter"
    :selected-item="(type, route) => type.name === route.params.resourceName"
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
      <FieldActionResourceListItem
        :name="item.name"
        :count="item.count"
        v-bind="props"
      />
    </template>

    <template #trailing>
      <KbShortcut keys="meta_e" />
    </template>
  </LinkList>
</template>
