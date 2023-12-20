<script lang="ts" setup>
defineProps<{
  error: any
}>()

function onStackClick(event: MouseEvent) {
  if (event.target instanceof HTMLSpanElement) {
    if (event.target.classList.contains('internal')) {
      return
    }

    const text = event.target.textContent ?? ''

    const [, file] = text.match(/at (.*)/) ?? []
    if (file) {
      return $fetch('/api/openInEditor', {
        params: {
          file,
        },
      })
    }
  }
}
</script>

<template>
  <div class="flex h-full overflow-auto">
    <div class="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 border border-primary-200/30 dark:border-primary-900/20 rounded-lg p-4 flex flex-col gap-2 max-w-full m-auto">
      <div class="flex gap-2 pb-2 border-b border-primary-500/50">
        <UIcon name="i-ph-warning" class="w-4 h-4 mt-0.5 flex-none" />
        <div class="w-full break-all font-mono text-sm">
          {{ error.data?.message ?? error.message }}
        </div>
      </div>
      <div
        v-if="error.data?.stack" class="w-full text-xs [&>pre]:break-all [&>pre]:whitespace-pre-wrap [&_.stack:not(.internal):hover]:underline [&_.stack:not(.internal)]:cursor-pointer" @click="onStackClick"
        v-html="error.data.stack"
      />
    </div>
  </div>
</template>
