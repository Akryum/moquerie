<script lang="ts" setup>
import type { ResourceFactoryField, ResourceFactoryFieldsMap, ResourceSchemaType } from '@moquerie/core'
import { set } from '@moquerie/core/util'
import clone from 'just-clone'
import { selectedField } from './FactoryField.vue'
import type { FlatField } from './formTypes.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  factoryFields: ResourceFactoryFieldsMap
  fakerLocale?: string
}>()

const emit = defineEmits<{
  'update:factoryFields': [factoryFields: ResourceFactoryFieldsMap]
}>()

const resourceTypeStore = useResourceTypeStore()

const flatFields = computed(() => {
  const result: FlatField[] = []

  function addFlatField(resourceType: ResourceSchemaType, fullKey: string[], key: string, depth: number, factoryField: ResourceFactoryField, parent: FlatField | null) {
    const field = resourceType.fields[key]

    const childResourceType = field.type === 'resource' ? resourceTypeStore.getResourceType(field.resourceName) : resourceType

    const flatField: FlatField = {
      fullKey: fullKey.join('.'),
      key,
      depth,
      factoryField,
      resourceType,
      field,
      childResourceType,
      parent,
    }
    result.push(flatField)

    if (factoryField.type === 'repeat' && factoryField.child) {
      addFlatField(resourceType, [...fullKey, 'child'], key, depth + 1, factoryField.child, flatField)
    }
    if (factoryField.type === 'object' && factoryField.children) {
      if (!childResourceType) {
        return
      }
      for (const childKey in factoryField.children) {
        addFlatField(childResourceType, [...fullKey, 'children', childKey], childKey, depth + 1, factoryField.children[childKey], flatField)
      }
    }
    if (factoryField.type === 'array' && factoryField.arrayChildren) {
      factoryField.arrayChildren.forEach((child, index) => {
        addFlatField(resourceType, [...fullKey, 'arrayChildren', index.toString()], key, depth + 1, child, flatField)
      })
    }
  }

  for (const key in props.resourceType.fields) {
    addFlatField(props.resourceType, [key], key, 0, props.factoryFields[key] ?? { type: 'null' }, null)
  }

  return result
})

const MIN_COUNT_TO_ENABLE_SEARCH = 10

const searchField = useLocalStorage('form-search-field', '')

const filteredFields = computed(() => {
  const result = flatFields.value

  if (result.length > MIN_COUNT_TO_ENABLE_SEARCH && searchField.value) {
    const reg = new RegExp(searchField.value, 'i')
    return result.filter(field => reg.test(field.fullKey))
  }

  return result
})

defineShortcuts({
  shift_arrowup: {
    usingInput: true,
    handler: () => {
      const values = filteredFields.value
      const index = values.findIndex(field => field.fullKey === selectedField.value)
      if (index > 0) {
        selectedField.value = values[index - 1].fullKey
      }
    },
  },
  shift_arrowdown: {
    usingInput: true,
    handler: () => {
      const values = filteredFields.value
      const index = values.findIndex(field => field.fullKey === selectedField.value)
      if (index < values.length - 1) {
        selectedField.value = values[index + 1].fullKey
      }
    },
  },
})

function updateField(flatField: FlatField, value: ResourceFactoryField) {
  const newValue: ResourceFactoryFieldsMap = clone(props.factoryFields)
  set(newValue, flatField.fullKey, value)
  emit('update:factoryFields', newValue)
}
</script>

<template>
  <div class="border border-gray-300 dark:border-gray-800 rounded-lg shadow-sm">
    <div class="flex flex-col">
      <div
        v-if="flatFields.length > MIN_COUNT_TO_ENABLE_SEARCH"
        class="flex items-center justify-center gap-2 p-2"
      >
        <UInput
          v-model="searchField"
          icon="i-ph-magnifying-glass"
          placeholder="Search field..."
          size="xs"
        />
      </div>

      <FactoryField
        v-for="flatField of filteredFields"
        :key="flatField.fullKey"
        :flat-field="flatField"
        :root-resource-type="resourceType"
        :faker-locale="fakerLocale"
        @update:factory-field="updateField(flatField, $event)"
      />
    </div>
  </div>
</template>
