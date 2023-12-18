<script lang="ts" setup>
import SuperJSON from 'superjson'
import { isReferencesOpen } from './resourceInstanceValueOverlays.js'
import type { FilterActive, ResourceInstance, ResourceInstanceReference, ResourceSchemaField, ResourceSchemaType } from '~/types/resource.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  field: ResourceSchemaField & {
    type: 'resource'
    array: false
  }
  modelValue: ResourceInstanceReference | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ResourceInstanceReference | null]
  'close': []
}>()

// All instances

// @TODO paginate

const filterActive = useLocalStorage<FilterActive>('resource-reference-table-filter-active', 'active')

const { data: allInstances, refresh: refreshAll } = await useFetch(`/api/resources/instances/${props.field.resourceName}`, {
  query: {
    filterActive,
  },
  transform: data => SuperJSON.parse(data) as ResourceInstance[],
})
onWindowFocus(refreshAll)

const currentInstance = computed(() => allInstances.value?.find(i => i.id === props.modelValue?.__id) ?? null)

// Remove selection

function removeSelection() {
  emit('update:modelValue', null)
}

defineShortcuts({
  delete: () => {
    removeSelection()
  },
})

// Toggle active

const instanceStore = useResourceInstanceStore()

async function bulkToggleActive() {
  if (!props.modelValue) {
    return
  }

  await instanceStore.bulkUpdateInstances({
    resourceName: props.field.resourceName,
    instanceIds: [props.modelValue.__id],
    data: {
      active: !currentInstance.value?.active ?? true,
    },
  })

  await refreshAll()
}

defineShortcuts({
  'meta_;': () => {
    bulkToggleActive()
  },
})

// Is Open

onMounted(() => {
  isReferencesOpen.value = true
})

onBeforeUnmount(() => {
  isReferencesOpen.value = false
})

// Move selection with keyboard

defineShortcuts({
  arrowdown: () => {
    const index = allInstances.value?.findIndex(i => i.id === props.modelValue?.__id) ?? -1
    const nextInstance = allInstances.value?.[index + 1]
    if (nextInstance) {
      emit('update:modelValue', { __id: nextInstance.id, __resourceName: nextInstance.resourceName })
    }
  },
  arrowup: () => {
    const index = allInstances.value?.findIndex(i => i.id === props.modelValue?.__id) ?? -1
    const nextInstance = allInstances.value?.[index - 1]
    if (nextInstance) {
      emit('update:modelValue', { __id: nextInstance.id, __resourceName: nextInstance.resourceName })
    }
  },
})
</script>

<template>
  <div class="flex flex-col gap-2 py-4">
    <div class="px-4 flex items-center justify-between">
      <div class="flex items-baseline gap-2">
        <div>
          {{ field.name }}
        </div>
        <div v-if="field.description" class="text-sm text-gray-500">
          {{ field.description }}
        </div>
      </div>

      <ResourceReferencesSummary
        :field="field"
        :value="modelValue"
      />
    </div>

    <!-- Toolbar -->
    <div class="flex items-center justify-center gap-2 px-4">
      <RadioButtonGroup
        v-model="filterActive"
        :options="[
          { label: 'Active', value: 'active', icon: 'i-ph-eye' },
          { label: 'All', value: 'all' },
          { label: 'Inactive', value: 'inactive', icon: 'i-ph-eye-slash' },
        ]"
        :button-attrs="{
          color: 'gray',
        }"
      />
    </div>

    <ResourceTable
      :resource-name="props.field.resourceName"
      :instances="allInstances ?? []"
      :selected-instance-ids="props.modelValue ? [props.modelValue.__id] : []"
      empty-placeholder="No instance referenced"
      dim-inactive-instances
      class="flex-1"
      @select="instance => $emit('update:modelValue', { __id: instance.id, __resourceName: instance.resourceName })"
    />

    <div class="flex items-center px-4" :class="[props.readonly ? 'justify-center' : 'justify-between']">
      <UButton
        color="gray"
        @click="$emit('close')"
      >
        Close

        <KbShortcut keys="escape" />
      </UButton>

      <template v-if="!readonly">
        <div class="flex gap-2">
          <UButton
            color="gray"
            :disabled="!currentInstance"
            icon="i-ph-eye"
            @click="bulkToggleActive()"
          >
            Toggle active

            <KbShortcut keys="meta_;" />
          </UButton>

          <UButton
            color="primary"
            variant="soft"
            :disabled="!currentInstance"
            icon="i-ph-minus-circle"
            @click="removeSelection()"
          >
            Remove selection

            <KbShortcut keys="Del" />
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>
