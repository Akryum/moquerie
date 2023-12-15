<script lang="ts" setup>
import { VTooltip as vTooltip } from 'floating-vue'
import type { ResourceSchemaField, ResourceSchemaType } from '~/types/resource.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  field: ResourceSchemaField
  modelValue: any
  autofocus?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: any]
}>()

const editReferencesButton = ref<any>()

defineExpose({
  editReferencesButton,
})

onMounted(() => {
  if (props.autofocus && editReferencesButton.value) {
    setTimeout(() => {
      editReferencesButton.value?.$el?.focus()
    }, 100) // Default NuxtUI autofocusDelay
  }
})
</script>

<template>
  <UFormGroup
    :label="field.name"
    :description="field.description"
  >
    <UButton
      v-if="field.type === 'resource'"
      ref="editReferencesButton"
      v-tooltip="'Edit references'"
      color="gray"
      block
    >
      <ResourceReferencesPreview
        :field="field"
        :value="modelValue"
      />
    </UButton>
    <UInput
      v-else
      :model-value="modelValue"
      :autofocus="autofocus"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </UFormGroup>
</template>
