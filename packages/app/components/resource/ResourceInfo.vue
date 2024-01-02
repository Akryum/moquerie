<script lang="ts" setup>
import { VTooltip as vTooltip } from 'floating-vue'
import type { ResourceSchemaType } from '@moquerie/core'

defineProps<{
  type: ResourceSchemaType
}>()
</script>

<template>
  <div>{{ type.name }}</div>
  <div v-if="type.description" class="text-xs text-gray-500 dark:text-gray-400 flex-shrink truncate">
    {{ type.description }}
  </div>
  <div class="flex gap-1">
    <UBadge
      v-if="!type.array"
      v-tooltip="'This resource can only have one active instance at a time'"
      color="blue"
      variant="subtle"
      class="cursor-help"
    >
      <UIcon name="i-ph-crown-simple" class="w-4 h-4 flex-none mr-1" />
      Singleton
    </UBadge>
    <UBadge
      v-for="tag in type.tags"
      :key="tag"
      variant="soft"
    >
      {{ tag }}
    </UBadge>
  </div>
</template>
