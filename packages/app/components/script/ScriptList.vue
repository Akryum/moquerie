<script lang="ts" setup>
import type { ScriptItem } from '@moquerie/core'

const { data, refresh } = await useFetch<ScriptItem[]>('/api/scripts')
onWindowFocus(refresh)

// Filter

function filter(script: ScriptItem, filterValue: string): boolean {
  return script.id.toLowerCase().includes(filterValue)
    || false
}

// Open

const route = useRoute()
const router = useRouter()

function onOpen(script: ScriptItem) {
  router.push({
    name: 'db-scripts-scriptId',
    params: {
      ...route.params,
      scriptId: script.id,
    },
    query: {
      ...route.query,
    },
  })
}
</script>

<template>
  <LinkList
    id="script-list"
    :items="data ?? []"
    :filter="filter"
    :selected-item="(script, route) => script.id === route.params.scriptId"
    filter-placeholder="Filter scripts by id..."
    class="p-2"
    @select="onOpen"
  >
    <template #default="{ item, ...props }">
      <ScriptListItem
        :script="item"
        v-bind="props"
      />
    </template>
  </LinkList>
</template>
