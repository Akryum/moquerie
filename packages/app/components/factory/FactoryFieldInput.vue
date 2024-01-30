<script lang="ts" setup>
import type { ResourceFactoryField, ResourceSchemaType } from '@moquerie/core'
import type { FlatField } from './formTypes.js'

const props = defineProps<{
  flatField: FlatField
  rootResourceType: ResourceSchemaType
  fakerLocale?: string
}>()

const emit = defineEmits<{
  'update:factoryField': [factoryField: ResourceFactoryField]
}>()

const resourceType = computed(() => props.flatField.resourceType)
const field = computed(() => props.flatField.field)

// Handle rootRef

const isCurrentRootRef = computed({
  get: () => props.flatField.factoryField.lazyBody === 'rootRef',
  set: (value: boolean) => {
    if (value) {
      update({
        type: 'other',
        lazy: true,
        lazyBody: 'rootRef',
      })
    }
    else {
      update({
        type: 'db',
        lazyBody: undefined,
      })
    }
  },
})

// Types

const generateTypeItems = computed(() => {
  const list: Array<{ value: ResourceFactoryField['type'], label: string }> = []

  const canBeArray = field.value.array && props.flatField.parent?.factoryField.type !== 'array'

  list.push({
    value: 'null',
    label: 'None',
  })

  if (field.value.type === 'resource') {
    if (!resourceType.value.inline && !props.flatField.childResourceType?.inline) {
      list.push({
        value: 'db',
        label: 'Resource',
      })
    }

    if (!canBeArray) {
      list.push({
        value: 'object',
        label: 'Inline',
      })
    }
  }
  else {
    list.push({
      value: 'other',
      label: 'Static',
    })

    if (field.value.type !== 'enum') {
      if (!canBeArray) {
        list.push({
          value: 'faker',
          label: 'Faker',
        })
      }
    }
    else {
      list.push({
        value: 'pickRandom',
        label: 'Random',
      })
    }

    if (canBeArray) {
      list.push({
        value: 'array',
        label: 'Array',
      })
    }
  }

  if (canBeArray) {
    list.push({
      value: 'repeat',
      label: 'Repeat',
    })
  }

  return list
})

async function selectGenerateType(index: number) {
  const selected = generateTypeItems.value[index]
  if (selected && props.flatField.factoryField) {
    update({
      type: selected.value as any,
    })
  }
}

const selectedTypeIndex = computed({
  get: () => {
    if (isCurrentRootRef.value) {
      const index = generateTypeItems.value.findIndex(item => item.value === 'db')
      if (index !== -1) {
        return index
      }
    }
    return generateTypeItems.value.findIndex(item => item.value === props.flatField.factoryField.type)
  },
  set: (index: number) => {
    selectGenerateType(index)
  },
})

const selectedType = computed(() => generateTypeItems.value[selectedTypeIndex.value]?.value)

defineShortcuts({
  arrowleft: {
    usingInput: true,
    handler: () => {
      const index = generateTypeItems.value.findIndex(item => item.value === props.flatField.factoryField.type)
      if (index > 0) {
        selectGenerateType(index - 1)
      }
    },
  },
  arrowright: {
    usingInput: true,
    handler: () => {
      const index = generateTypeItems.value.findIndex(item => item.value === props.flatField.factoryField.type)
      if (index < generateTypeItems.value.length - 1) {
        selectGenerateType(index + 1)
      }
    },
  },
})

// Update

async function update(updated: Partial<ResourceFactoryField>) {
  const newValue: ResourceFactoryField = {
    ...props.flatField.factoryField,
    ...updated,
  }

  switch (newValue.type) {
    case 'db': {
      if (!newValue.dbResource && field.value.type === 'resource') {
        newValue.dbResource = field.value.resourceName
      }
      if (!newValue.dbFn && !newValue.dbReferences) {
        newValue.dbReferences = []
      }
      break
    }

    case 'array': {
      if (!newValue.arrayChildren) {
        newValue.arrayChildren = []
      }
      break
    }

    case 'object': {
      if (!newValue.children) {
        if (field.value.type === 'resource' && props.flatField.childResourceType) {
          const { fields } = await $fetch('/api/factories/defaultFields', {
            query: {
              resourceName: props.flatField.childResourceType.name,
            },
          })
          newValue.children = fields
        }
        else {
          newValue.children = {}
        }
      }
      break
    }
  }

  emit('update:factoryField', newValue)
}

function updateArraySize(newSize: number) {
  let arrayChildren = props.flatField.factoryField.arrayChildren?.slice() ?? []
  if (arrayChildren.length < newSize) {
    arrayChildren = [
      ...arrayChildren,
      ...Array.from({ length: newSize - arrayChildren.length }, () => ({ type: 'null' }) as const),
    ]
  }
  else if (arrayChildren.length > newSize) {
    arrayChildren = arrayChildren.slice(0, newSize)
  }

  const newValue: ResourceFactoryField = {
    ...props.flatField.factoryField,
    arrayChildren,
  }
  emit('update:factoryField', newValue)
}

// Popper

const isResourceRefsOpen = ref(false)

// Pick random

const pickOneRandom = computed({
  get: () => props.flatField.factoryField.dbFn === 'pickOneRandom',
  set: (value: boolean) => {
    update({
      type: value ? 'db' : props.flatField.factoryField.lazyBody === 'rootRef' ? 'other' : 'db',
      dbFn: value ? 'pickOneRandom' : props.flatField.parent?.factoryField.type === 'repeat' ? 'findManyReferences' : undefined,
    })
  },
})
</script>

<template>
  <div class="w-[500px]">
    <UTabs
      v-model="selectedTypeIndex"
      :items="generateTypeItems"
    />

    <div v-if="selectedType === 'other'">
      <template v-if="field.type === 'enum'">
        <UFormGroup label="Value">
          <ResourceEnumSelect
            :model-value="flatField.factoryField.value"
            :field="field"
            @update:model-value="update({ value: $event })"
          />
        </UFormGroup>
      </template>
      <template v-else>
        <UFormGroup label="JavaScript code">
          <MonacoEditor
            :filename="`field-${resourceType.name}-${flatField.fullKey}-other-edit.js`"
            :source="flatField.factoryField.rawCode ?? ''"
            :options="{
              language: 'javascript',
              lineNumbers: 'off',
              folding: false,
            }"
            class="h-[200px] border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden"
            @update:source="update({ rawCode: $event })"
          />
        </UFormGroup>
      </template>
    </div>

    <div v-else-if="selectedType === 'faker'" class="space-y-2">
      <div class="py-2 flex items-center gap-2">
        <UToggle
          :model-value="flatField.factoryField.lazy"
          @update:model-value="update({ lazy: $event })"
        />
        Lazy (allow access to current <span class="font-mono text-sm bg-primary/10 rounded px-1">item</span>)
      </div>

      <FactoryFakerInput
        :resource-type="resourceType"
        :type="field.type"
        :factory-field="flatField.factoryField"
        :array="field.array"
        :faker-locale="fakerLocale"
        @update:factory-field="update"
      />
    </div>

    <div v-else-if="selectedType === 'db'" class="space-y-2">
      <!-- @TODO support interface / selecting different types -->
      <div class="px-2 py-1 border border-gray-200 dark:border-gray-800 rounded flex items-center gap-1">
        <UIcon name="i-ph-database" />
        {{ flatField.factoryField.dbResource }}
      </div>

      <div class="py-2 flex items-center gap-2">
        <UToggle
          v-model="pickOneRandom"
        />
        Select random instance
      </div>

      <div v-if="!pickOneRandom && flatField.childResourceType?.name === rootResourceType.name" class="py-2 flex items-center gap-2">
        <UToggle
          v-model="isCurrentRootRef"
        />
        <div>
          <div>Select created {{ rootResourceType.name }} instance</div>
          <div class="opacity-50 text-sm">
            Will select the instance being created by the factory.
          </div>
        </div>
      </div>

      <template v-if="!isCurrentRootRef">
        <UButton
          v-if="!flatField.factoryField.dbFn && flatField.parent?.factoryField?.type !== 'repeat'"
          color="gray"
          block
          @click="isResourceRefsOpen = true"
        >
          <ResourceReferencesSummary
            v-if="field.type === 'resource'"
            :field="field"
            :value="flatField.factoryField.dbReferences"
          />
        </UButton>

        <UFormGroup v-else-if="flatField.factoryField.dbFn && !pickOneRandom" label="Parameters">
          <MonacoEditor
            :filename="`field-${resourceType.name}-${flatField.fullKey}-dbParams-edit.js`"
            :source="flatField.factoryField.dbParams ?? ''"
            :options="{
              language: 'javascript',
              lineNumbers: 'off',
              folding: false,
            }"
            class="h-[200px] border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden"
            @update:source="update({ dbParams: $event })"
          />
        </UFormGroup>
      </template>
    </div>

    <div v-else-if="selectedType === 'repeat'" class="flex gap-2">
      <UFormGroup label="Min" class="flex-1">
        <UInput
          type="number"
          :model-value="flatField.factoryField.repeatMin ?? 0"
          @update:model-value="update({ repeatMin: $event })"
        />
      </UFormGroup>

      <UFormGroup label="Max" class="flex-1">
        <UInput
          type="number"
          :model-value="flatField.factoryField.repeatMax ?? 0"
          @update:model-value="update({ repeatMax: $event })"
        />
      </UFormGroup>
    </div>

    <div v-else-if="selectedType === 'array'" class="">
      <UFormGroup label="Size">
        <div class="flex gap-4">
          <UInput
            type="number"
            :model-value="flatField.factoryField.arrayChildren?.length ?? 0"
            class="flex-1 w-0"
            @update:model-value="updateArraySize"
          />

          <UButton
            icon="i-ph-plus"
            color="gray"
            @click="updateArraySize((flatField.factoryField.arrayChildren?.length ?? 0) + 1)"
          />

          <UButton
            icon="i-ph-minus"
            color="gray"
            @click="updateArraySize((flatField.factoryField.arrayChildren?.length ?? 0) - 1)"
          />
        </div>
      </UFormGroup>
    </div>

    <div v-else class="flex items-end justify-center p-6 gap-4">
      <UIcon name="i-ph-arrow-bend-left-up" class="w-10 h-10 flex-none text-primary-500" />
      <p>Select a generate type to continue</p>
    </div>

    <UModal
      v-model="isResourceRefsOpen"
      :ui="{
        width: 'sm:max-w-[calc(100vw-100px)]',
        height: 'h-[calc(100vh-80px)]',
        wrapper: 'z-[10001]',
      }"
    >
      <ResourceInstanceValueReferences
        v-if="field.type === 'resource'"
        :resource-type="resourceType"
        :field="field"
        :model-value="flatField.factoryField.dbReferences ?? null"
        class="h-full"
        @update:model-value="update({
          dbReferences: $event,
        })"
        @close="isResourceRefsOpen = false"
      />
    </UModal>
  </div>
</template>
