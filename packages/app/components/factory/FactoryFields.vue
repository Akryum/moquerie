<script lang="ts" setup>
import type { ResourceFactoryValue, ResourceSchemaType } from '@moquerie/core'
import { selectedField } from './FactoryField.vue'

const props = defineProps<{
  resourceType: ResourceSchemaType
  value: ResourceFactoryValue
  fakerLocale?: string
}>()

const emit = defineEmits<{
  'update:value': [ResourceFactoryValue]
}>()

defineShortcuts({
  shift_arrowup: {
    usingInput: true,
    handler: () => {
      if (props.resourceType.type !== 'object') {
        return
      }
      const values = Object.values(props.resourceType.fields)
      const index = values.findIndex(field => field.name === selectedField.value)
      if (index > 0) {
        selectedField.value = values[index - 1].name
      }
    },
  },
  shift_arrowdown: {
    usingInput: true,
    handler: () => {
      if (props.resourceType.type !== 'object') {
        return
      }
      const values = Object.values(props.resourceType.fields)
      const index = values.findIndex(field => field.name === selectedField.value)
      if (index < values.length - 1) {
        selectedField.value = values[index + 1].name
      }
    },
  },
})

function updateField(name: string, value: ResourceFactoryValue) {
  const newValue: ResourceFactoryValue = {
    ...props.value,
    children: {
      ...props.value.children,
      [name]: value,
    },
  }
  emit('update:value', newValue)
}
</script>

<template>
  <div class="border border-gray-300 dark:border-gray-800 rounded-lg shadow-sm">
    <div
      v-if="resourceType.type === 'object' && value.children"
      class="flex flex-col divide-y divide-gray-300 dark:divide-gray-800"
    >
      <FactoryField
        v-for="field of resourceType.fields"
        :key="field.name"
        :resource-type="resourceType"
        :field="field"
        :value="value.children[field.name] ?? {}"
        :faker-locale="fakerLocale"
        @update:value="updateField(field.name, $event)"
      />
    </div>
  </div>
</template>
