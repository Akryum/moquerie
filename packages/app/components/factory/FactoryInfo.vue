<script lang="ts" setup>
import type { ResourceFactory } from '@moquerie/core'

defineProps<{
  factory: ResourceFactory
}>()
</script>

<template>
  <div class="leading-tight">
    {{ factory.name }}
  </div>
  <div
    v-if="factory.info.description"
    class="text-sm opacity-50 leading-tight"
  >
    {{ factory.info.description }}
  </div>
  <div v-if="factory.info.tags" class="flex gap-1">
    <UBadge
      v-for="tag in factory.info.tags"
      :key="tag"
      variant="soft"
    >
      {{ tag }}
    </UBadge>
  </div>
</template>
