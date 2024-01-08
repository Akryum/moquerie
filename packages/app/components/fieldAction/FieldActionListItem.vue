<script lang="ts" setup>
import { vTooltip } from 'floating-vue'

const props = defineProps<{
  resourceName: string
  fieldName: string
  file: string
}>()

async function openFile() {
  await $fetch('/api/openInEditor', {
    params: {
      file: props.file,
    },
  })
}
</script>

<template>
  <div class="flex items-center gap-2 px-6 py-1">
    <div class="font-mono">
      <span
        class="opacity-50"
      >{{ resourceName }}.</span><span>{{ fieldName }}</span>
    </div>

    <UButton
      v-tooltip="`Open ${file}`"
      icon="i-ph-file-arrow-up"
      variant="link"
      :padded="false"
      @click="openFile()"
    />
  </div>
</template>
