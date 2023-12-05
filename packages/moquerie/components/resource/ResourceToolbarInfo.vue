<script lang="ts" setup>
import type { ResourceSchemaType } from '~/types/resource.js'

defineProps<{
  type: ResourceSchemaType
}>()
</script>

<template>
  <div>{{ type.name }}</div>
  <div v-if="type.description" class="text-xs text-gray-500 dark:text-gray-400 flex-shrink truncate">
    {{ type.description }}
  </div>
  <div v-if="type.tags.length" class="flex gap-1">
    <UBadge
      v-for="tag in type.tags"
      :key="tag"
      variant="soft"
    >
      {{ tag }}
    </UBadge>
  </div>
</template>
