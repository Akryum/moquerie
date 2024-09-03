<script lang="ts" setup>
import type { FilterActive, ResourceInstance } from '@moquerie/core'

type ResourceIdsByType = Record<string, string[]>

const props = defineProps<{
  resources?: ResourceIdsByType
}>()

const emit = defineEmits<{
  cancel: []
  select: [resources: ResourceIdsByType]
}>()

const resourceName = useLocalStorage('resource-select-resource-name', '')

const instanceStore = useResourceInstanceStore()

const filterActive = useLocalStorage<FilterActive>('resource-select-table-filter-active', 'all')

const table = ref<any>()

watch(filterActive, () => {
  table.value?.scrollTop()
})

const searchText = useLocalStorage<string>('resource-select-table-search-text', '')

watchEffect(() => {
  instanceStore.fetchInstances({
    resourceName: resourceName.value,
    filterActive: filterActive.value,
    searchText: searchText.value,
  })
})

// Selected ids

const selectedResources = ref(structuredClone(toRaw(props.resources)) ?? {})

watch(() => props.resources, () => {
  selectedResources.value = structuredClone(toRaw(props.resources)) ?? {}
})

const totalCount = computed(() => countItemsInRecordOfArrays(selectedResources.value))

function toggleSelection(instance: ResourceInstance) {
  let selectedIds = selectedResources.value[resourceName.value]

  if (!selectedIds) {
    selectedIds = selectedResources.value[resourceName.value] = []
  }

  if (selectedIds.includes(instance.id)) {
    selectedIds.splice(selectedIds.indexOf(instance.id), 1)
  }
  else {
    selectedIds.push(instance.id)
  }
}

// Utils

async function selectAll(resourceName?: string) {
  const ids = await $fetch('/api/resources/ids')
  if (resourceName) {
    selectedResources.value[resourceName] = ids[resourceName]
  }
  else {
    selectedResources.value = ids
  }
}

function selectNone() {
  selectedResources.value = {}
}

// Submit

function select() {
  if (totalCount.value) {
    emit('select', selectedResources.value)
  }
}

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: select,
  },

  escape: {
    usingInput: true,
    handler: () => {
      emit('cancel')
    },
  },
})
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-950/20 border-b border-gray-200 dark:border-gray-800">
      <div class="flex-1">
        <UButton
          color="gray"
          @click="$emit('cancel')"
        >
          Cancel

          <KbShortcut keys="escape" />
        </UButton>
      </div>

      <div class="flex items-center justify-center gap-2 text-gray-500">
        <UIcon name="i-ph-database" class="w-4 h-4 flex-none" />
        Select resource instances
      </div>

      <div class="flex-1 flex justify-end">
        <UButton
          :disabled="!totalCount"
          @click="select()"
        >
          Select {{ totalCount }} instance{{ totalCount <= 1 ? '' : 's' }}

          <KbShortcut keys="meta_enter" />
        </UButton>
      </div>
    </div>

    <div class="flex flex-1 h-0 divide-x divide-gray-100 dark:divide-gray-800">
      <div class="w-[200px] flex-none">
        <ResourceList
          v-model:resource-name="resourceName"
        >
          <template #item-trailing="{ item }">
            <div v-if="selectedResources[item.name]?.length" class="text-xs font-bold text-white bg-primary-500 px-1 rounded ml-auto">
              {{ selectedResources[item.name].length }}
            </div>
          </template>
        </ResourceList>
      </div>

      <div v-if="resourceName" class="flex flex-col flex-1 w-0 h-full">
        <!-- Toolbar -->
        <div class="flex p-2 gap-2 items-center">
          <div class="flex-1" />

          <UInput
            v-model="searchText"
            icon="i-ph-magnifying-glass"
            placeholder="Search comment, tags, values..."
          />

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

          <div class="flex-1" />
        </div>

        <ResourceTable
          ref="table"
          :key="resourceName"
          :resource-name="resourceName"
          :instances="instanceStore.instances"
          :selected-instance-ids="selectedResources[resourceName]"
          :dim-inactive-instances="filterActive === 'all'"
          @select="toggleSelection($event)"
          @select-multiple="selectedResources[resourceName] = $event.map(i => i.id)"
        />
      </div>
    </div>

    <div class="flex items-center gap-2 p-2 border-t border-gray-100 dark:border-gray-800">
      <div class="flex-1" />

      <UButton
        color="gray"
        variant="ghost"
        @click="selectAll(resourceName)"
      >
        Select all {{ resourceName }}
      </UButton>

      <UButton
        color="gray"
        variant="ghost"
        @click="selectAll(resourceName)"
      >
        Unselect all {{ resourceName }}
      </UButton>

      <div class="w-px h-4 bg-gray-200 dark:bg-gray-800" />

      <UButton
        color="gray"
        variant="ghost"
        @click="selectAll()"
      >
        Select all
      </UButton>

      <UButton
        color="gray"
        variant="ghost"
        @click="selectNone()"
      >
        Select none
      </UButton>
    </div>
  </div>
</template>
