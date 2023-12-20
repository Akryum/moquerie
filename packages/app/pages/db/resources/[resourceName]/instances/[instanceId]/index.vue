<script lang="ts" setup>
import { VTooltip as vTooltip } from 'floating-vue'
import { isAnyOpen } from '~/components/resource/resourceInstanceValueOverlays.js'

defineOptions({
  inheritAttrs: false,
})

const route = useRoute()
const router = useRouter()

const resourceName = () => route.params.resourceName as string
const instanceIds = computed(() => {
  const value = route.params.instanceId
  return Array.isArray(value) ? value : value.split(',')
})

const instanceStore = useResourceInstanceStore()

watchEffect(() => {
  if (instanceIds.value.length === 1) {
    instanceStore.fetchInstance({
      resourceName: resourceName(),
      instanceId: instanceIds.value[0],
    })
  }
})

const toast = useToast()

// Resource type

const resourceTypeStore = useResourceTypeStore()

const resourceType = await resourceTypeStore.fetchResourceType(resourceName())

// Toggle active

async function bulkToggleActive() {
  if (!instanceIds.value.length) {
    return
  }

  await instanceStore.bulkUpdateInstances({
    resourceName: resourceName(),
    instanceIds: instanceIds.value,
    data: {
      active: !instanceStore.instances.find(i => i.id === instanceIds.value[0])?.active ?? true,
    },
  })
}

defineShortcuts({
  'meta_;': {
    usingInput: true,
    handler: bulkToggleActive,
    whenever: [() => !isAnyOpen.value],
  },
})

// Duplicate

async function duplicate() {
  if (!instanceIds.value.length) {
    return
  }

  const copies = await instanceStore.duplicateInstances(resourceName(), instanceIds.value)

  router.push({
    name: 'db-resources-resourceName-instances-instanceId',
    params: {
      resourceName: resourceName(),
      instanceId: copies.map(i => i.id).join(','),
    },
  })
}

defineShortcuts({
  meta_d: {
    usingInput: true,
    handler: duplicate,
    whenever: [() => !isAnyOpen.value],
  },
})

// Bulk edit

const showBulkEditModal = ref(false)

defineShortcuts({
  meta_i: {
    usingInput: true,
    handler: () => {
      if (!instanceIds.value.length) {
        return
      }
      showBulkEditModal.value = true
    },
    whenever: [() => !isAnyOpen.value],
  },
})

// Delete

const showConfirmDeleteModal = ref(false)

async function deleteInstances() {
  showConfirmDeleteModal.value = false

  await instanceStore.deleteInstances(resourceName(), instanceIds.value)

  toast.add({
    id: 'instances-deleted',
    title: `Deleted ${instanceIds.value.length} instance${instanceIds.value.length > 1 ? 's' : ''}!`,
    icon: 'i-ph-trash',
    color: 'green',
  })

  router.replace({
    name: 'db-resources-resourceName-instances',
    params: {
      resourceName: resourceName(),
    },
  })
}

defineShortcuts({
  delete: {
    handler: () => {
      if (!instanceIds.value.length) {
        return
      }
      showConfirmDeleteModal.value = true
    },
    whenever: [() => !isAnyOpen.value],
  },
})

// Update value

async function onSubmitValue(value: any) {
  await instanceStore.updateInstance({
    resourceName: resourceName(),
    instanceId: instanceIds.value[0],
    data: {
      value,
    },
  })

  toast.add({
    id: 'instance-value-updated',
    title: 'Instance data updated!',
    icon: 'i-ph-pencil-simple',
    color: 'green',
  })
}
</script>

<template>
  <div
    v-if="instanceIds?.length > 1"
    class="flex flex-col items-center justify-center p-2"
    v-bind="$attrs"
  >
    <div class="flex flex-col gap-4 items-center">
      <div class="flex flex-col gap-2 items-center">
        <div class="bg-primary-100 dark:bg-primary-900 rounded-full px-4 py-2 text-primary-500 font-bold">
          {{ instanceIds.length }}
        </div>
        <div>Selected instances</div>
      </div>

      <div class="flex flex-col items-stretch gap-2">
        <UButton
          v-tooltip="'An inactive instance is not returned when fetching instances'"
          color="gray"
          icon="i-ph-eye"
          @click="bulkToggleActive()"
        >
          Toggle active
          <KbShortcut keys="meta_;" />
        </UButton>

        <UButton
          color="gray"
          icon="i-ph-copy"
          @click="duplicate()"
        >
          Duplicate
          <KbShortcut keys="meta_d" />
        </UButton>

        <UButton
          color="gray"
          icon="i-ph-pencil-simple"
          @click="showBulkEditModal = true"
        >
          Bulk edit
          <KbShortcut keys="meta_i" />
        </UButton>

        <UButton
          color="gray"
          icon="i-ph-trash"
          @click="showConfirmDeleteModal = true"
        >
          Delete
          <KbShortcut keys="Del" />
        </UButton>
      </div>
    </div>
  </div>
  <div
    v-else-if="instanceStore.instance"
    class="overflow-auto divide-y divide-gray-200 dark:divide-gray-800"
    v-bind="$attrs"
  >
    <div class="p-2 flex items-center gap-1 text-sm text-gray-500">
      <span class="flex-1">
        Switch to previous or next
      </span>
      <KbShortcut keys="pageup" />
      <KbShortcut keys="pagedown" />
    </div>

    <div class="p-2">
      <ResourceInstanceInfo
        :instance="instanceStore.instance"
      />
    </div>

    <div class="p-2 grid grid-flow-col auto-cols-[80px] gap-1 justify-center">
      <VerticalButton
        :icon="instanceStore.instance.active ? 'i-ph-eye' : 'i-ph-eye-slash'"
        shortcut="meta_;"
        @click="bulkToggleActive()"
      >
        {{ instanceStore.instance.active ? 'Active' : 'Inactive' }}

        <template #tooltip>
          <div class="max-w-[300px]">
            <p>Click to {{ instanceStore.instance.active ? 'deactivate' : 'activate' }} the instance.</p>
            <p class="italic opacity-70">
              An inactive instance is not returned when fetching instances.
            </p>
          </div>
        </template>
      </VerticalButton>

      <VerticalButton
        icon="i-ph-copy"
        shortcut="meta_d"
        @click="duplicate()"
      >
        Duplicate
      </VerticalButton>

      <VerticalButton
        icon="i-ph-trash text-red-500"
        shortcut="Del"
        @click="showConfirmDeleteModal = true"
      >
        Delete
      </VerticalButton>
    </div>

    <div v-if="resourceType" class="p-2">
      <ResourceInstanceValueForm
        :resource-type="resourceType"
        :instance="instanceStore.instance"
        @submit="onSubmitValue"
      />
    </div>
  </div>

  <ConfirmModal
    :shown="showConfirmDeleteModal"
    title="Are you sure?"
    icon="i-ph-trash"
    confirm-icon="i-ph-trash"
    :confirm-label="`Delete ${instanceIds.length} instance${instanceIds.length > 1 ? 's' : ''}`"
    @cancel="showConfirmDeleteModal = false"
    @confirm="deleteInstances()"
  />

  <UModal
    v-model="showBulkEditModal"
  >
    <ResourceBulkEditForm
      v-if="resourceType"
      :resource-type="resourceType"
      :instance-ids="instanceIds"
      class="p-4"
      @cancel="showBulkEditModal = false"
      @submit="showBulkEditModal = false"
    />
  </UModal>
</template>
