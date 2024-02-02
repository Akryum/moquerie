<script lang="ts" setup>
import type { HistoryRecordForList } from '@moquerie/core'
import { vTooltip } from 'floating-vue'
import { HistoryIcons } from './icons.js'

const props = defineProps<{
  record: HistoryRecordForList
}>()

const timeAgo = useTimeAgo(() => props.record.date)
</script>

<template>
  <LinkListItem
    v-tooltip="{
      content: record.type,
      placement: 'right',
    }"
    :to="{
      name: 'db-history-recordId',
      params: {
        ...$route.params,
        recordId: record.id,
      },
      query: {
        ...$route.query,
      },
    }"
  >
    <div class="flex items-center gap-1">
      <UIcon :name="HistoryIcons[record.type]" class="w-4 h-4 flex-none" />
      <div>
        {{ record.resourceName }}
      </div>
      <div class="text-xs opacity-50 text-right flex-1 w-0 truncate">
        {{ timeAgo }}
      </div>
    </div>
  </LinkListItem>
</template>
