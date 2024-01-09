<script lang="ts" setup>
import { Tooltip, vTooltip } from 'floating-vue'

const props = defineProps<{
  resourceName: string
  fieldName: string
  file: string
  code: string
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
    <Tooltip class="font-mono" placement="right-start">
      <span
        class="opacity-50"
      >{{ resourceName }}.</span><span>{{ fieldName }}</span>

      <template #popper>
        <pre>{{ code }}</pre>
      </template>
    </Tooltip>

    <UButton
      v-tooltip="`Open ${file}`"
      icon="i-ph-file-arrow-up"
      variant="link"
      :padded="false"
      @click="openFile()"
    />
  </div>
</template>
