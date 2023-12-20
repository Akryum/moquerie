<script lang="ts" setup>
import type { ResourceSchemaField } from '@moquerie/core'

defineProps<{
  modelValue: any
  field: ResourceSchemaField & { type: 'enum' }
}>()

defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>

<template>
  <USelectMenu
    :model-value="modelValue"
    :options="field.values"
    value-attribute="value"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #label>
      <div v-if="field.values.some(v => v.value === modelValue)">
        {{ modelValue }}
      </div>
      <div v-else class="text-gray-500">
        Select an option...
      </div>
    </template>

    <template #option="{ option }">
      <div>
        <div>{{ option.value }}</div>
        <div
          v-if="option.description"
          class="text-xs text-gray-500"
        >
          {{ option.description }}
        </div>
      </div>
    </template>
  </USelectMenu>
</template>
