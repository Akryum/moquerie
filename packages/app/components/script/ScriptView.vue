<script lang="ts" setup>
import type { ScriptItem } from '@moquerie/core'
import { vTooltip } from 'floating-vue'
import { useRunScript } from './runScript.js'

const props = defineProps<{
  id: string
}>()

const { data, refresh } = await useFetch<ScriptItem>(() => `/api/scripts/${props.id}`)
onWindowFocus(refresh)

// File

async function openFile() {
  if (!data.value) {
    return
  }
  await $fetch('/api/openInEditor', {
    params: {
      file: data.value.file,
    },
  })
}

// Run

const { run, reports } = useRunScript()

const currentReports = computed(() => reports.value[props.id] ?? [])

const route = useRoute()
const router = useRouter()

watchEffect(() => {
  if (route.query.run) {
    run(props.id)
    router.replace({
      query: {
        ...route.query,
        run: undefined,
      },
    })
  }
})

function clearLogs() {
  reports.value[props.id] = []
}
</script>

<template>
  <div v-if="data" class="flex flex-col">
    <div class="flex items-center gap-2 p-4">
      <UIcon name="i-ph-code-block" class="w-6 h-6 flex-none" />
      <div>
        {{ data.id }}
      </div>
      <div class="opacity-50 flex-1 truncate">
        {{ data.description }}
      </div>

      <UButton
        icon="i-ph-play"
        @click="run(id)"
      >
        Run script
      </UButton>

      <UButton
        v-tooltip="`Open ${data.file}`"
        icon="i-ph-file-arrow-up"
        color="gray"
        @click="openFile()"
      />

      <UButton
        v-tooltip="'Clear logs'"
        icon="i-ph-broom"
        color="gray"
        @click="clearLogs()"
      />
    </div>

    <div class="flex-1 h-0 overflow-y-auto flex flex-col-reverse gap-4 p-4">
      <ScriptRunReport
        v-for="report in currentReports"
        :key="report.id"
        :report="report"
      />
    </div>
  </div>
</template>
