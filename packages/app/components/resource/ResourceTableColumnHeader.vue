<script lang="ts" setup>
import type { Col } from './tableTypes.js'

defineProps<{
  col: Col
}>()
</script>

<template>
  <div
    class="px-2 py-1 truncate text-xs font-bold text-gray-500 flex-none"
    :style="{
      width: `${col.size}px`,
    }"
  >
    {{ col.label }}
  </div>
</template>
