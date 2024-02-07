<script lang="ts" setup>
defineProps<{
  error: any
}>()
</script>

<template>
  <div class="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 border border-rose-200/30 dark:border-rose-900/20 rounded-lg p-2 flex  gap-2 max-w-full">
    <UIcon name="i-ph-warning" class="w-4 h-4 mt-0.5 flex-none" />
    <div class="w-full whitespace-pre-wrap break-all font-mono text-sm">
      {{ error.data?.message ?? error.message }}
    </div>
  </div>
</template>
