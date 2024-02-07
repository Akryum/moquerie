<script lang="ts" setup>
import type { ScriptRunReport } from '@moquerie/core'

const props = defineProps<{
  report: ScriptRunReport
}>()

const ago = useTimeAgo(() => props.report.startTime)
</script>

<template>
  <div class="p-4 border border-gray-500/10 hover:border-gray-500/20 rounded-lg space-y-1">
    <div class="flex items-center justify-center gap-2">
      <UIcon
        name="i-ph-terminal" class="w-6 h-6 flex-none"
        :class="[
          report.error ? 'text-red-500' : 'text-green-500',
        ]"
      />
      <div class="opacity-50 text-xs">
        {{ ago }}
      </div>
    </div>

    <ScriptLogItem
      v-for="(log, index) in report.logs"
      :key="index"
      :log="log"
    />

    <ErrorMessageSimple
      v-if="report.error"
      :error="report.error"
    />
    <div v-else>
      <div class="flex items-center gap-2">
        <UIcon name="i-ph-check" class="w-4 h-4 flex-none text-green-500" />
        <div class="opacity-50 font-mono text-sm">
          Completed in {{ report.endTime - report.startTime }}ms
        </div>
      </div>
    </div>
  </div>
</template>
