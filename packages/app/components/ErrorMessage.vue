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
    <div class="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 border border-rose-200/30 dark:border-rose-900/20 rounded-lg p-4 flex flex-col gap-2 max-w-full m-auto">
      <div class="flex gap-2">
        <UIcon name="i-ph-warning" class="w-4 h-4 mt-0.5 flex-none" />
        <div class="w-full whitespace-pre-wrap break-all font-mono text-sm">
          {{ error.data?.message ?? error.message }}
        </div>
      </div>
      <div
        v-if="error.data?.stack ?? error.stack" class="pt-2 border-t border-rose-500/50 w-full text-xs [&>pre]:break-all [&>pre]:whitespace-pre-wrap [&_.stack:not(.internal):hover]:underline [&_.stack:not(.internal)]:cursor-pointer" @click="onStackClick"
        v-html="error.data?.stack ?? error.stack"
      />
    </div>
  </div>
</template>
