<script lang="ts" setup>
const route = useRoute()

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
  <div v-if="instanceIds?.length > 1" class="flex flex-col items-center justify-center p-2">
    <div class="flex flex-col gap-4 items-center">
      <div class="flex flex-col gap-2 items-center">
        <div class="bg-primary-100 dark:bg-primary-900 rounded-full px-4 py-2 text-primary-500 font-bold">
          {{ instanceIds.length }}
        </div>
        <div>Selected instances</div>
      </div>

      <div class="flex flex-col items-stretch">
        <UButton
          color="gray"
          icon="i-ph-eye"
          @click="bulkToggleActive()"
        >
          Toggle active
          <KbShortcut keys="meta_;" />
        </UButton>
      </div>
    </div>
  </div>
  <div v-else-if="instanceStore.instance" class="overflow-auto divide-y divide-gray-200 dark:divide-gray-800">
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
        show-toggle-active-shortcut
      />
    </div>
    <div v-if="resourceType" class="p-2">
      <ResourceInstanceValueForm
        :resource-type="resourceType"
        :instance="instanceStore.instance"
        @submit="onSubmitValue"
      />
    </div>
  </div>
</template>
