<script lang="ts" setup>
import type { HistoryRecordForList } from '@moquerie/core'
import SuperJSON from 'superjson'

const { data: currentBranch, refresh: refreshCurrentBranch } = useFetch('/api/branches/current', {
  key: 'currentBranch',
})
onWindowFocus(refreshCurrentBranch)

const { data, refresh } = await useFetch('/api/history', {
  query: {
    branch: currentBranch.value,
  },
})
onWindowFocus(refresh)

const parsed = computed<{
  records: HistoryRecordForList[]
  page: number
  pageSize: number
  total: number
} | null>(() => data.value ? SuperJSON.parse(data.value) : null)
const records = computed(() => parsed.value?.records ?? [])

// Filter

function filter(record: HistoryRecordForList, filterValue: string): boolean {
  return record.resourceName.toLowerCase().includes(filterValue)
    || record.type.toLowerCase().includes(filterValue)
    || false
}

// Open

const route = useRoute()
const router = useRouter()

function onOpen(record: HistoryRecordForList) {
  router.push({
    name: 'db-history-recordId',
    params: {
      ...route.params,
      recordId: record.id,
    },
    query: {
      ...route.query,
    },
  })
}
</script>

<template>
  <LinkList
    id="history-record-list"
    :items="records"
    :filter="filter"
    :selected-item="(record, route) => record.id === route.params.recordId"
    filter-placeholder="Filter records by resource name..."
    class="p-2"
    @select="onOpen"
  >
    <template #default="{ item, ...props }">
      <HistoryRecordListItem
        :record="item"
        v-bind="props"
      />
    </template>
  </LinkList>
</template>
