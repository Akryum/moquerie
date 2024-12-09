<script lang="ts" setup>
import type { HistoryRecord } from '@moquerie/core'
import { vTooltip } from 'floating-vue'
import clone from 'just-clone'
import { diffApply } from 'just-diff-apply'
import SuperJSON from 'superjson'
import { HistoryIcons } from './icons.js'

const props = defineProps<{
  recordId: string
}>()

const { data: record } = await useFetch(() => `/api/history/${props.recordId}`, {
  transform: (data: string) => SuperJSON.parse<any>(data) as HistoryRecord,
})

const timeAgo = useTimeAgo(() => record.value?.date ?? new Date())

// Copy ref

const toast = useToast()
const { copy } = useClipboard()
function copyRef() {
  copy(`{
  "__resourceName": "${record.value?.resourceName}",
  "__id": "${record.value?.instanceId}"
}`)

  toast.add({
    title: 'Reference copied',
    icon: 'i-ph-clipboard',
  })
}

// New value

const newValue = computed(() => {
  if (record.value?.value && record.value?.diff) {
    const result = clone(record.value.value)
    diffApply(result, record.value.diff)
    return result
  }
  return null
})
</script>

<template>
  <div v-if="record" class="flex flex-col">
    <div class="flex items-center gap-2 p-4">
      <UIcon :name="HistoryIcons[record.type]" class="w-4 h-4 flex-none" />
      <div class="opacity-50">
        {{ record.type }}
      </div>
      <div>
        {{ record.resourceName }}
      </div>
      <div class="font-mono text-primary">
        {{ record.instanceId }}
      </div>
      <UButton
        v-tooltip="'Copy ref'"
        variant="link"
        :padded="false"
        icon="i-ph-clipboard"
        @click="copyRef()"
      />
      <div v-tooltip="'View in explorer'" class="leading-none">
        <UButton
          variant="link"
          :padded="false"
          icon="i-ph-arrow-square-up-right"
          :to="{
            name: 'db-resources-resourceName-instances-instanceId',
            params: {
              resourceName: record.resourceName,
              instanceId: record.instanceId,
            },
          }"
        />
      </div>
      <div class="opacity-50 text-right flex-1 w-0 truncate">
        <span v-tooltip="record.date.toLocaleString()">{{ timeAgo }}</span>
      </div>
    </div>

    <template v-if="record.value">
      <MonacoDiffEditor
        v-if="newValue"
        class="flex-1"
        :filename="`history-${record.id}-diff.json`"
        :from="JSON.stringify(record.value, null, 2)"
        :to="JSON.stringify(newValue, null, 2)"
        language="json"
      />
      <MonacoEditor
        v-else
        class="flex-1"
        :filename="`history-${record.id}.json`"
        :source="JSON.stringify(record.value, null, 2)"
        :options="{
          language: 'json',
          readOnly: true,
        }"
      />
    </template>
  </div>
</template>
