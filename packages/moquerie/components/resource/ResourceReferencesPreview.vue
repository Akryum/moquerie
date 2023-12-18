<script lang="ts" setup>
import SuperJSON from 'superjson'
import type { ResourceInstance, ResourceSchemaField } from '~/types/resource.js'

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
    />
  </div>
</template>
