<script lang="ts" setup>
const route = useRoute()
</script>

<template>
  <div class="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
    <div class="p-2">
      <div>{{ route.params.resourceName }}</div>
    </div>
    <div class="flex-1 overflow-y-auto flex">
      <UIcon name="i-ph-traffic-cone" class="w-12 h-12 m-auto opacity-30" />
    </div>
  </div>
</template>
