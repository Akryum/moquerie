<script lang="ts" setup>
defineProps<{
  icon: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-12">
    <div class="bg-rose-500/20 rounded-full p-12">
      <UIcon :name="icon" class="w-12 h-12 text-rose-500" />
    </div>
    <div class="max-w-[400px] text-lg text-center">
      <slot />
    </div>
  </div>
</template>
