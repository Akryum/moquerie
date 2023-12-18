<script lang="ts" setup>
import SuperJSON from 'superjson'
import { isReferencesOpen } from './resourceInstanceValueOverlays.js'
import type { FilterActive, ResourceInstance, ResourceInstanceReference, ResourceSchemaField, ResourceSchemaType } from '~/types/resource.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  field: ResourceSchemaField & {
    type: 'resource'
    array: true
  }
  modelValue: ResourceInstanceReference[] | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ResourceInstanceReference[]]
  'close': []
}>()

// Refs

const listOfRefs = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue
  }
  else {
    return []
  }
})

const ids = computed(() => listOfRefs.value.map(ref => ref.__id))

// Mode

const mode = ref<'referenced' | 'other'>('referenced')

defineShortcuts({
  meta_r: {
    usingInput: true,
    handler: () => {
      mode.value = mode.value === 'referenced' ? 'other' : 'referenced'
    },
  },
})

// Referenced instances

const filterActive = useLocalStorage<FilterActive>('resource-reference-table-filter-active', 'active')

const { data: referencedInstancesRaw, refresh: refreshReferenced } = await useFetch(`/api/resources/instances/${props.field.resourceName}/getByIds`, {
  method: 'POST',
  body: {
    ids,
  },
  transform: data => SuperJSON.parse(data) as ResourceInstance[],
})
onWindowFocus(refreshReferenced)

const referencedInstances = computed(() => referencedInstancesRaw.value?.filter(i => filterActive.value === 'all' || i.active === (filterActive.value === 'active')) ?? [])

// All instances

// @TODO paginate

const { data: allInstances, refresh: refreshAll } = await useFetch(`/api/resources/instances/${props.field.resourceName}`, {
  query: {
    filterActive,
  },
  transform: data => SuperJSON.parse(data) as ResourceInstance[],
})
onWindowFocus(refreshAll)

const otherInstances = computed(() => (allInstances.value ?? []).filter(instance => !ids.value.includes(instance.id)))

const currentInstances = computed(() => (mode.value === 'referenced' ? referencedInstances.value : otherInstances.value) ?? [])

// Selection

const selectedIds = {
  referenced: ref<string[]>([]),
  other: ref<string[]>([]),
} as const

const currentSelection = computed(() => selectedIds[mode.value].value)

// Add

function addSelected() {
  emit('update:modelValue', [
    ...listOfRefs.value,
    ...selectedIds.other.value.map(id => ({
      __id: id,
      __resourceName: props.resourceType.name,
    })),
  ])
  selectedIds.referenced.value = selectedIds.other.value
  selectedIds.other.value = []
}

defineShortcuts({
  enter: () => {
    addSelected()
  },
})

// Remove

function removeSelected() {
  emit('update:modelValue', listOfRefs.value.filter(ref => !selectedIds.referenced.value.includes(ref.__id)))
  selectedIds.other.value = selectedIds.referenced.value
  selectedIds.referenced.value = []
}

defineShortcuts({
  delete: () => {
    removeSelected()
  },
})

// Toggle active

const instanceStore = useResourceInstanceStore()

async function bulkToggleActive() {
  await instanceStore.bulkUpdateInstances({
    resourceName: props.field.resourceName,
    instanceIds: currentSelection.value,
    data: {
      active: !currentInstances.value.find(i => i.id === currentSelection.value[0])?.active ?? true,
    },
  })
  if (mode.value === 'referenced') {
    await refreshReferenced()
  }
  else {
    await refreshAll()
  }
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
    <div
      class="flex items-center gap-2 px-4"
      :class="$props.readonly ? 'justify-center' : 'justify-between'"
    >
      <div
        v-if="!readonly"
        class="flex items-center gap-2"
      >
        <RadioButtonGroup
          v-model="mode"
          :options="[
            {
              label: 'Already Referenced',
              value: 'referenced',
              icon: 'i-ph-link',
            },
            {
              label: 'Other Instances',
              value: 'other',
              icon: 'i-ph-plus-circle',
            },
          ]"
        />

        <KbShortcut keys="meta_r" />
      </div>

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
      :instances="currentInstances"
      :selected-instance-ids="selectedIds[mode].value"
      empty-placeholder="No instances referenced"
      dim-inactive-instances
      class="flex-1"
      @select="instance => selectedIds[mode].value = [instance.id]"
      @select-multiple="instances => selectedIds[mode].value = instances.map(i => i.id)"
      @dblclick="mode === 'referenced' ? removeSelected() : addSelected()"
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
        <div class="opacity-50 italic text-xs">
          Double-click to {{ mode === 'referenced' ? 'remove' : 'add' }}
        </div>

        <div class="flex gap-2">
          <UButton
            color="gray"
            :disabled="!currentSelection.length"
            icon="i-ph-eye"
            @click="bulkToggleActive()"
          >
            Toggle active

            <KbShortcut keys="meta_;" />
          </UButton>

          <template v-if="mode === 'other'">
            <UButton
              color="primary"
              :disabled="!selectedIds.other.value.length"
              icon="i-ph-plus-circle"
              @click="addSelected()"
            >
              Add {{ selectedIds.other.value.length }} instance{{ selectedIds.other.value.length > 1 ? 's' : '' }}

              <KbShortcut keys="enter" />
            </UButton>
          </template>

          <template v-else-if="mode === 'referenced'">
            <UButton
              color="primary"
              :disabled="!selectedIds.referenced.value.length"
              icon="i-ph-minus-circle"
              @click="removeSelected()"
            >
              Remove {{ selectedIds.referenced.value.length }} instance{{ selectedIds.referenced.value.length > 1 ? 's' : '' }}

              <KbShortcut keys="delete" />
            </UButton>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
