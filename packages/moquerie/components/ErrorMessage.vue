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
  <div class="flex h-full p-12 overflow-auto">
    <div class="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 border border-rose-200/30 dark:border-rose-900/20 rounded-2xl p-6 flex flex-col gap-4 max-w-full m-auto">
      <UIcon name="i-ph-seal-warning-duotone" class="w-8 h-8 flex-none" />
      <div class="w-full break-all font-mono pb-4 border-b border-rose-500/50">
        {{ error.data?.message ?? error.message }}
      </div>
      <div
        v-if="error.data?.stack" class="w-full text-xs [&>pre]:break-all [&>pre]:whitespace-pre-wrap [&_.stack:not(.internal):hover]:underline [&_.stack:not(.internal)]:cursor-pointer" @click="onStackClick"
        v-html="error.data.stack"
      />
    </div>
  </div>
</template>
