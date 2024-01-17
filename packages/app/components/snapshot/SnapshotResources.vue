<script lang="ts" setup>
import type { DatabaseSnapshot, FilterActive } from '@moquerie/core'
import SuperJSON from 'superjson'

const props = defineProps<{
  snapshot: DatabaseSnapshot
}>()

const snapshotStore = useSnapshotStore()
const toast = useToast()

const { data: counts, refresh: refreshCounts } = await useFetch(() => `/api/snapshots/${props.snapshot.id}/resources/count`)
onWindowFocus(refreshCounts)

const resourceName = useLocalStorage('snapshot-view-resource-name', '')
const filterActive = useLocalStorage<FilterActive>('snapshot-view-table-filter-active', 'active')
const searchText = useLocalStorage<string>('snapshot-view-table-search-text', '')

const { data, refresh } = await useFetch(() => `/api/snapshots/${props.snapshot.id}/resources/${resourceName.value}`, {
  query: {
    filterActive,
    searchText,
  },
  transform: (data: string) => SuperJSON.parse(data),
})
onWindowFocus(refresh)

// Delete

const selectedIds = ref<string[]>([])

watch(resourceName, () => {
  selectedIds.value = []
})

const resourcesConfirmRemoveShown = ref(false)

async function removeResources() {
  try {
    await $fetch(`/api/snapshots/${props.snapshot.id}/resources/remove`, {
      method: 'POST',
      body: {
        resourceIds: {
          [resourceName.value]: selectedIds.value,
        },
      },
    })
    await snapshotStore.refreshSnapshot()

    toast.add({
      id: 'snapshot-resources-removed',
      title: 'Resources deleted from snapshot!',
      icon: 'i-ph-check-circle',
      color: 'green',
    })

    resourcesConfirmRemoveShown.value = false
  }
  catch (e: any) {
    toast.add({
      id: 'snapshot-resources-remove-error',
      title: 'Error deleting resources from snapshot',
      description: e.data?.message ?? e.message,
      icon: 'i-ph-x-circle',
      color: 'red',
    })
  }
}

// Add

const resourcesSelectShown = ref(false)

async function onSelectNewResources(resourceIds: Record<string, string[]>) {
  try {
    await $fetch(`/api/snapshots/${props.snapshot.id}/resources/add`, {
      method: 'POST',
      body: {
        resourceIds,
      },
    })
    await snapshotStore.refreshSnapshot()

    toast.add({
      id: 'snapshot-resources-added',
      title: 'Resources saved to snapshot!',
      icon: 'i-ph-check-circle',
      color: 'green',
    })

    resourcesSelectShown.value = false
  }
  catch (e: any) {
    toast.add({
      id: 'snapshot-resources-add-error',
      title: 'Error saving resources to snapshot',
      description: e.data?.message ?? e.message,
      icon: 'i-ph-x-circle',
      color: 'red',
    })
  }
}
</script>

<template>
  <div class="flex-1 h-0 flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
    <div class="p-2 flex items-center gap-2">
      <UButton
        color="gray"
        icon="i-ph-plus-circle"
        @click="resourcesSelectShown = true"
      >
        Save instances to snapshot
      </UButton>

      <div class="flex-1" />

      <UButton
        :disabled="!selectedIds.length"
        color="gray"
        icon="i-ph-minus-circle"
        @click="resourcesConfirmRemoveShown = true"
      >
        Delete {{ selectedIds.length }} instance{{ selectedIds.length > 1 ? 's' : '' }} from snapshot
      </UButton>
    </div>

    <div class="flex flex-1 h-0 divide-x divide-gray-100 dark:divide-gray-800">
      <div class="w-[200px] flex-none">
        <ResourceList
          v-if="counts"
          v-model:resource-name="resourceName"
          :filter-list="types => types.filter(type => counts[type.name] > 0)"
        >
          <template #item-trailing="{ item }">
            <div class="text-xs font-bold text-primary-500 ml-auto">
              {{ counts[item.name] ?? 0 }}
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
          :key="resourceName"
          :resource-name="resourceName"
          :instances="data ?? []"
          :selected-instance-ids="selectedIds"
          :dim-inactive-instances="filterActive === 'all'"
          readonly
          @select="selectedIds = [$event.id]"
          @select-multiple="selectedIds = $event.map(i => i.id)"
        />
      </div>
    </div>

    <UModal
      v-model="resourcesSelectShown"
      :ui="{
        width: 'sm:w-[calc(100vw-200px)] sm:max-w-[1200px]',
        height: 'sm:h-[calc(100vh-200px)] sm:max-h-[900px]',
      }"
    >
      <ResourceSelectMultiple
        class="h-full"
        @cancel="resourcesSelectShown = false"
        @select="onSelectNewResources"
      />
    </UModal>

    <ConfirmModal
      :shown="resourcesConfirmRemoveShown"
      :title="`Delete ${selectedIds.length} instance${selectedIds.length > 1 ? 's' : ''} from snapshot?`"
      icon="i-ph-warning-circle"
      confirm-label="Permanently delete from snapshot"
      confirm-icon="i-ph-trash"
      @cancel="resourcesConfirmRemoveShown = false"
      @confirm="removeResources()"
    />
  </div>
</template>
