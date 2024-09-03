<script lang="ts" setup>
import type { FilterActive, ResourceInstance } from '@moquerie/core'

const emit = defineEmits<{
  cancel: []
  select: [instance: ResourceInstance]
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

const selectedInstance = shallowRef<ResourceInstance | null>(null)

function select(instance?: ResourceInstance) {
  if (instance) {
    selectedInstance.value = instance
  }

  if (selectedInstance.value) {
    emit('select', selectedInstance.value)
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
        Select resource instance
      </div>

      <div class="flex-1 flex justify-end">
        <UButton
          :disabled="!selectedInstance"
          @click="select()"
        >
          Select instance

          <KbShortcut keys="meta_enter" />
        </UButton>
      </div>
    </div>

    <div class="flex flex-1 h-0 divide-x divide-gray-100 dark:divide-gray-800">
      <div class="w-[200px] flex-none">
        <ResourceList
          v-model:resource-name="resourceName"
        />
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
          :selected-instance-ids="[selectedInstance?.id].filter(Boolean) as string[]"
          :dim-inactive-instances="filterActive === 'all'"
          @select="selectedInstance = $event"
          @activate="select($event)"
        />
      </div>
    </div>
  </div>
</template>
