<script lang="ts" setup>
import SuperJSON from 'superjson'
import { vTooltip } from 'floating-vue'
import type { ResourceInstance, ResourceSchemaField } from '@moquerie/core'

const props = defineProps<{
  field: ResourceSchemaField & {
    type: 'resource'
  }
  value: any
}>()

// Ids

const listOfRefs = computed(() => {
  if (Array.isArray(props.value)) {
    return props.value
  }
  else {
    return [props.value].filter(Boolean)
  }
})

const ids = computed(() => listOfRefs.value.map(ref => ref.__id))

// Instances

// const filterActive = useLocalStorage<FilterActive>('resource-reference-table-filter-active', 'active')

const { data: instances, refresh: refreshReferenced } = await useFetch(`/api/resources/instances/${props.field.resourceName}/getByIds`, {
  method: 'POST',
  body: {
    ids,
  },
  transform: data => SuperJSON.parse(data) as ResourceInstance[],
})
onWindowFocus(refreshReferenced)

// const instances = computed(() => instancesRaw.value?.filter(i => filterActive.value === 'all' || i.active === (filterActive.value === 'active')) ?? [])

const firstActive = computed(() => instances.value?.find(i => i.active))
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- @TODO fix issue with floating-vue <Menu>: <button> closes it :( -->

    <!-- <div class="flex justify-center">
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
    </div> -->

    <ResourceTable
      v-if="instances"
      :resource-name="field.resourceName"
      :instances="instances"
      empty-placeholder="No instances referenced"
      dim-inactive-instances
      class="resource-table flex-1"
    >
      <template v-if="!field.array" #header-start>
        <div class="w-[42px] flex-none" />
      </template>
      <template v-if="!field.array" #row-start="{ instance }">
        <div
          v-if="instance.id === firstActive?.id"
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
</template>
