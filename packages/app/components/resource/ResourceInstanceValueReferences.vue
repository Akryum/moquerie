<script lang="ts" setup>
import SuperJSON from 'superjson'
import { Tooltip, vTooltip } from 'floating-vue'
import type { FilterActive, ResourceInstance, ResourceInstanceReference, ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'
import { isReferencesOpen } from './resourceInstanceValueOverlays.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  field: ResourceSchemaField & {
    type: 'resource'
  }
  modelValue: ResourceInstanceReference[] | null
  readonly?: boolean
  showApply?: boolean
  hasChanges?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ResourceInstanceReference[]]
  'close': []
  'apply': []
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

// Multiple types

const resourceTypeStore = useResourceTypeStore()

const fieldResourceType = computed(() => resourceTypeStore.getResourceType(props.field.resourceName))

const isMultiTypes = computed(() => !!fieldResourceType.value?.implementations)

const countPerType = computed(() => {
  const countPerType = {} as Record<string, number>
  for (const ref of listOfRefs.value) {
    countPerType[ref.__resourceName] = (countPerType[ref.__resourceName] ?? 0) + 1
  }
  return countPerType
})

// Current type

const { isFavorite } = await useFavoriteResources()

const implementations = fieldResourceType.value?.implementations ?? []
const initialSelectedType = implementations.find(impl => isFavorite(impl)) ?? implementations[0]

const selectedType = ref(initialSelectedType)

const currentResourceName = computed(() => selectedType.value ?? props.field.resourceName)

// Referenced instances

const filterActive = useLocalStorage<FilterActive>('resource-reference-table-filter-active', 'active')

const { data: referencedInstancesRaw, refresh: refreshReferenced } = await useFetch(() => `/api/resources/instances/${currentResourceName.value}/getByIds`, {
  method: 'POST',
  body: {
    ids,
  },
  transform: data => SuperJSON.parse(data) as ResourceInstance[],
})
onWindowFocus(refreshReferenced)

const referencedInstances = computed(() => referencedInstancesRaw.value?.filter(i => filterActive.value === 'all' || i.active === (filterActive.value === 'active')) ?? [])

// Orphans

const orphans = ref<string[]>([])

function computeOrphans() {
  orphans.value = listOfRefs.value.filter(ref => ref.__resourceName === currentResourceName.value && !referencedInstancesRaw.value?.find(i => i.id === ref.__id)).map(ref => ref.__id)
}

watchDebounced(ids, computeOrphans, {
  debounce: 200,
  immediate: true,
})
watchDebounced(referencedInstancesRaw, computeOrphans, {
  debounce: 200,
  immediate: true,
})

function clearOrphans() {
  emit('update:modelValue', listOfRefs.value.filter(ref => !orphans.value.includes(ref.__id)))
}

// All instances

// @TODO paginate

const { data: allInstances, refresh: refreshAll } = await useFetch(() => `/api/resources/instances/${currentResourceName.value}`, {
  query: {
    filterActive,
  },
  transform: data => SuperJSON.parse(data) as ResourceInstance[],
})
onWindowFocus(refreshAll)

const otherInstances = computed(() => (allInstances.value ?? []).filter(instance => !ids.value.includes(instance.id)))

function getInstances(mode: 'referenced' | 'other') {
  return mode === 'referenced' ? referencedInstances.value : otherInstances.value
}

// Selection

const selectedIds = {
  referenced: ref<string[]>(referencedInstances.value.length ? [referencedInstances.value[0].id] : []),
  other: ref<string[]>([]),
} as const

const currentSelection = computed(() => [...selectedIds.referenced.value, ...selectedIds.other.value])

// Add

function addSelected() {
  emit('update:modelValue', [
    ...listOfRefs.value,
    ...selectedIds.other.value.map(id => ({
      __id: id,
      __resourceName: currentResourceName.value,
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

// Move refs

function moveUp() {
  if (!selectedIds.referenced.value.length) {
    return
  }
  let newRefs = listOfRefs.value
  const selectedRefs = selectedIds.referenced.value.map(id => newRefs.find(ref => ref.__id === id)).filter(Boolean) as ResourceInstanceReference[]
  newRefs = newRefs.filter(ref => ref.__id === selectedIds.referenced.value[0] || !selectedIds.referenced.value.includes(ref.__id))
  const firstIndex = newRefs.findIndex(ref => ref.__id === selectedIds.referenced.value[0])
  newRefs.splice(firstIndex, 1)
  newRefs.splice(Math.max(0, firstIndex - 1), 0, ...selectedRefs)
  emit('update:modelValue', newRefs)
}

defineShortcuts({
  meta_arrowup: () => {
    moveUp()
  },
})

function moveDown() {
  if (!selectedIds.referenced.value.length) {
    return
  }
  let newRefs = listOfRefs.value
  const selectedRefs = selectedIds.referenced.value.map(id => newRefs.find(ref => ref.__id === id)).filter(Boolean) as ResourceInstanceReference[]
  newRefs = newRefs.filter(ref => ref.__id === selectedIds.referenced.value[0] || !selectedIds.referenced.value.includes(ref.__id))
  const firstIndex = newRefs.findIndex(ref => ref.__id === selectedIds.referenced.value[0])
  newRefs.splice(firstIndex, 1)
  newRefs.splice(Math.min(listOfRefs.value.length - 1, firstIndex + 1), 0, ...selectedRefs)
  emit('update:modelValue', newRefs)
}

defineShortcuts({
  meta_arrowdown: () => {
    moveDown()
  },
})

// Toggle active

const instanceStore = useResourceInstanceStore()

async function bulkToggleActive(mode: 'referenced' | 'other') {
  const ids = allInstances.value?.filter(i => currentSelection.value.includes(i.id)).map(i => i.id) ?? []
  if (!ids.length) {
    return
  }

  await instanceStore.bulkUpdateInstances({
    resourceName: currentResourceName.value,
    instanceIds: ids,
    data: {
      active: !getInstances(mode).find(i => i.id === currentSelection.value[0])?.active ?? true,
    },
  })
  if (mode === 'referenced') {
    await refreshReferenced()
  }
  else {
    await refreshAll()
  }
}

defineShortcuts({
  'meta_;': () => {
    bulkToggleActive('referenced')
  },
  'meta_shift_;': () => {
    bulkToggleActive('other')
  },
})

// Selected instance preview

const firstActiveReference = computed(() => referencedInstancesRaw.value?.find(i => i.active)?.id)

// Is Open

onMounted(() => {
  isReferencesOpen.value = true
})

onBeforeUnmount(() => {
  isReferencesOpen.value = false
})
</script>

<template>
  <div class="flex flex-col gap-4 py-4">
    <div class="px-4 flex items-center justify-between">
      <div class="flex-1 flex items-center gap-2">
        <div>
          {{ field.name }}
        </div>

        <UIcon v-if="field.array" v-tooltip="'Array'" name="i-ph-circles-three" />
        <UIcon v-else v-tooltip="'Single reference'" name="i-ph-database" />

        <div v-if="field.description" class="text-sm text-gray-500">
          {{ field.description }}
        </div>
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

      <div class="flex-1 flex justify-end">
        <ResourceReferencesSummary
          :field="field"
          :value="modelValue"
        />
      </div>
    </div>

    <!-- Orphans -->
    <div
      v-if="orphans.length"
      class="flex items-center gap-2 p-2 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 text-orange-500 mx-4"
    >
      <UIcon name="i-ph-selection-slash" class="w-6 h-6" />
      <div class="truncate">
        There is {{ orphans.length }} orphan reference{{ orphans.length > 1 ? 's' : '' }}
      </div>
      <InfoTooltip>
        <div class="max-w-[400px] flex items-center gap-4 p-2">
          <div class="w-16 h-16 flex items-center justify-center bg-orange-500/10 rounded-full flex-none">
            <UIcon name="i-ph-selection-slash" class="w-8 h-8 text-orange-500" />
          </div>
          <div>
            Orphan references are references to instances that no longer exist. If you don't plan on importing them back, you can clear the references.
          </div>
        </div>
      </InfoTooltip>

      <div class="flex-1" />
      <UButton
        color="orange"
        icon="i-ph-trash"
        @click="clearOrphans()"
      >
        Clear orphan{{ orphans.length > 1 ? 's' : '' }}
      </UButton>
    </div>

    <div class="flex flex-1 h-0 divide-x divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800">
      <div v-if="isMultiTypes">
        <ResourceList
          v-model:resource-name="selectedType"
          :filter-list="types => types.filter(type => fieldResourceType?.implementations?.includes(type.name))"
        >
          <template #item-trailing="{ item }">
            <div class="text-xs font-bold text-white bg-primary-500 px-1 rounded ml-auto">
              {{ countPerType[item.name] ?? 0 }}
            </div>
          </template>
        </ResourceList>
      </div>

      <div class="flex flex-1 w-0 h-full divide-x divide-gray-200 dark:divide-gray-800">
        <div
          v-for="m of (['referenced', 'other'] as const)"
          :key="m"
          class="w-1/2 flex flex-col gap-2"
        >
          <div class="flex-1 h-0">
            <ResourceTable
              :resource-name="currentResourceName"
              :instances="getInstances(m)"
              :selected-instance-ids="selectedIds[m].value"
              empty-placeholder="No instances referenced"
              dim-inactive-instances
              class="h-full"
              @select="instance => selectedIds[m].value = [instance.id]"
              @select-multiple="instances => selectedIds[m].value = instances.map(i => i.id)"
              @dblclick="m === 'referenced' ? removeSelected() : addSelected()"
            >
              <template v-if="m === 'referenced' && !field.array" #header-start>
                <div class="w-[42px] flex-none" />
              </template>
              <template v-if="m === 'referenced' && !field.array" #row-start="{ instance }">
                <div
                  v-if="instance.id === firstActiveReference"
                  v-tooltip="'Selected instance'"
                  class="w-[42px] flex-none flex items-center justify-center text-primary-500"
                >
                  <UIcon
                    name="i-ph-arrow-fat-right-fill"
                  />
                </div>
                <div v-else class="w-[42px] flex-none" />
              </template>
            </ResourceTable>
          </div>

          <div class="flex items-center justify-center gap-2 pb-2">
            <UButton
              color="gray"
              :disabled="!selectedIds[m].value.length"
              icon="i-ph-eye"
              @click="bulkToggleActive(m)"
            >
              Toggle active

              <KbShortcut :keys="m === 'referenced' ? 'meta_;' : 'meta_shift_;'" />
            </UButton>

            <template v-if="!readonly">
              <template v-if="m === 'referenced'">
                <Tooltip>
                  <UButton
                    color="gray"
                    icon="i-ph-arrow-fat-line-up"
                    @click="moveUp()"
                  />

                  <template #popper>
                    <div>Move up</div>
                    <KbShortcut keys="meta_arrowup" />
                  </template>
                </Tooltip>

                <Tooltip>
                  <UButton
                    color="gray"
                    icon="i-ph-arrow-fat-line-down"
                    @click="moveDown()"
                  />

                  <template #popper>
                    <div>Move down</div>
                    <KbShortcut keys="meta_arrowdown" />
                  </template>
                </Tooltip>
              </template>

              <UButton
                v-if="m === 'referenced'"
                color="primary"
                :disabled="!selectedIds.referenced.value.length"
                icon="i-ph-minus-circle"
                @click="removeSelected()"
              >
                Remove {{ selectedIds.referenced.value.length }} instance{{ selectedIds.referenced.value.length > 1 ? 's' : '' }}

                <KbShortcut keys="delete" />
              </UButton>

              <UButton
                v-if="m === 'other'"
                color="primary"
                :disabled="!selectedIds.other.value.length"
                icon="i-ph-plus-circle"
                @click="addSelected()"
              >
                Add {{ selectedIds.other.value.length }} instance{{ selectedIds.other.value.length > 1 ? 's' : '' }}

                <KbShortcut keys="enter" />
              </UButton>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center px-4" :class="[props.readonly ? 'justify-center' : 'justify-between']">
      <div class="flex-1 flex items-center gap-2">
        <UButton
          color="gray"
          @click="$emit('close')"
        >
          Close

          <KbShortcut keys="escape" />
        </UButton>

        <UButton
          v-if="showApply && !props.readonly"
          icon="i-ph-pencil-simple"
          :disabled="!hasChanges"
          @click="$emit('apply')"
        >
          Apply changes

          <KbShortcut keys="meta_enter" />
        </UButton>
      </div>

      <template v-if="!readonly">
        <div class="opacity-50 italic text-xs">
          Double-click to add/remove
        </div>
      </template>
    </div>
  </div>
</template>
