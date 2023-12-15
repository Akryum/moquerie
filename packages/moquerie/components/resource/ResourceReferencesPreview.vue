<script lang="ts" setup>
import type { ResourceSchemaField } from '~/types/resource.js'

const props = defineProps<{
  field: ResourceSchemaField & {
    type: 'resource'
  }
  value: any
}>()

const list = computed(() => {
  const value = props.value
  if (Array.isArray(value)) {
    return value
  }
  else {
    return [value].filter(Boolean)
  }
})
</script>

<template>
  <div class="flex items-center gap-1">
    <UIcon name="i-ph-database" class="w-4 h-4" />
    <span class="font-bold text-sm font-mono text-primary-500">{{ list.length }}</span>
    <span class="text-xs">{{ field.resourceName }}{{ list.length > 1 ? 's' : '' }}</span>
  </div>
</template>
