<script lang="ts" setup>
import type { ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'
import { vTooltip } from 'floating-vue'

defineProps<{
  field: ResourceSchemaField
  resourceType: ResourceSchemaType
  childResourceType?: ResourceSchemaType
}>()
</script>

<template>
  <UIcon v-if="field.array" v-tooltip="'Array'" name="i-ph-brackets-square" />
  <template v-else-if="field.type === 'resource'">
    <UIcon v-if="childResourceType?.inline" v-tooltip="'Inline resource'" name="i-ph-brackets-curly" />
    <UIcon v-else v-tooltip="'Single reference'" name="i-ph-database" />
  </template>
</template>
