<script lang="ts" setup>
import type { ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'

defineProps<{
  resourceType: ResourceSchemaType
  childResourceType: ResourceSchemaType
  field: ResourceSchemaField & { type: 'resource' }
}>()

const model = defineModel<any>()

function updateModel(fieldName: string, value: any) {
  model.value = {
    ...model.value,
    [fieldName]: value,
  }
}
</script>

<template>
  <div class="p-2 border border-gray-200 dark:border-gray-800 rounded-md flex flex-col items-stretch gap-4">
    <ResourceInstanceValueFormInput
      v-for="(nestedField, key) in childResourceType.fields"
      :key="key"
      :model-value="model?.[nestedField.name]"
      :resource-type="childResourceType"
      :field="nestedField"
      @update:model-value="updateModel(nestedField.name, $event)"
    />
  </div>
</template>
