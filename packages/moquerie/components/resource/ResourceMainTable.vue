<script lang="ts" setup>
import type { FilterActive, ResourceInstance } from '~/types/resource.js'

const props = defineProps<{
  resourceName: string
}>()

const instanceStore = useResourceInstanceStore()

const filterActive = useLocalStorage<FilterActive>('resource-main-table-filter-active', 'active')

const table = ref<any>()

watch(filterActive, () => {
  table.value?.scrollTop()
})

watchEffect(() => {
  instanceStore.fetchInstances({
    resourceName: props.resourceName,
    filterActive: filterActive.value,
  })
})

const route = useRoute()
const router = useRouter()

const instanceIds = computed(() => {
  const value = route.params.instanceId
  return Array.isArray(value) ? value : value?.split(',') ?? []
})

function onSelectInstance(instance: ResourceInstance) {
  router.push({
    name: 'db-resources-resourceName-instances-instanceId',
    params: {
      resourceName: props.resourceName,
      instanceId: instance.id,
    },
  })
}

defineShortcuts({
  pageup: {
    usingInput: true,
    handler: () => {
      const index = instanceStore.instances.findIndex(instance => instance.id === instanceIds.value?.[0])
      if (index > 0) {
        onSelectInstance(instanceStore.instances[index - 1])
      }
    },
  },
  pagedown: {
    usingInput: true,
    handler: () => {
      const index = instanceStore.instances.findIndex(instance => instance.id === instanceIds.value?.[0])
      if (index < instanceStore.instances.length - 1) {
        onSelectInstance(instanceStore.instances[index + 1])
      }
    },
  },
})

// Multi-select

function onSelectMultipleInstances(instances: ResourceInstance[]) {
  const ids = instances.map(instance => instance.id).join(',')
  router.push({
    name: 'db-resources-resourceName-instances-instanceId',
    params: {
      resourceName: props.resourceName,
      instanceId: ids,
    },
  })
}
</script>

<template>
  <div class="flex w-full h-full">
    <div class="flex flex-col w-full h-full">
      <!-- Toolbar -->
      <div class="flex p-2 gap-2 items-center">
        <div class="flex-1" />

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
        :resource-name="props.resourceName"
        :instances="instanceStore.instances"
        :selected-instance-ids="instanceIds"
        :dim-inactive-instances="filterActive === 'all'"
        @select="onSelectInstance"
        @select-multiple="onSelectMultipleInstances"
      />
    </div>
  </div>
</template>
