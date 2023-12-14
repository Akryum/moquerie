<script lang="ts" setup>
import type { ResourceInstance, ResourceSchemaField, ResourceSchemaType } from '~/types/resource.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  instance: ResourceInstance
  field: ResourceSchemaField & {
    type: 'resource'
  }
}>()

const list = computed(() => {
  const value = props.instance.value[props.field.name]
  if (Array.isArray(value)) {
    return value
  }
  else {
    return [value].filter(Boolean)
  }
})
</script>

<template>
  <div class="flex items-center gap-1 border border-primary/10 px-2 py-1 rounded-lg">
    <UIcon name="i-ph-database" class="w-4 h-4" />
    <span class="font-bold text-sm font-mono text-primary-500">{{ list.length }}</span>
    <span class="text-xs">{{ field.resourceName }}{{ list.length > 1 ? 's' : '' }}</span>
  </div>
</template>
