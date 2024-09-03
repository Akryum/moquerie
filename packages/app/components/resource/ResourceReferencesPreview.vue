<script lang="ts" setup>
import SuperJSON from 'superjson'
import { vTooltip } from 'floating-vue'
import type { FilterActive, ResourceInstance, ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'

const props = defineProps<{
  field: ResourceSchemaField & {
    type: 'resource'
  }
  value: any
  resourceType: ResourceSchemaType
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

// Multiple types

const isMultiTypes = computed(() => !!props.resourceType?.implementations)

const countPerType = computed(() => {
  const countPerType = {} as Record<string, number>
  for (const ref of listOfRefs.value) {
    countPerType[ref.__resourceName] = (countPerType[ref.__resourceName] ?? 0) + 1
  }
  return countPerType
})

// Current type

const { isFavorite } = await useFavoriteResources()

const implementations = props.resourceType.implementations ?? []
const initialSelectedType = implementations.find(impl => isFavorite(impl)) ?? implementations[0]

const selectedType = ref(initialSelectedType)

const currentResourceName = computed(() => selectedType.value ?? props.field.resourceName)

// Instances

const filterActive = useLocalStorage<FilterActive>('resource-reference-table-filter-active', 'active')

const { data: instancesRaw, refresh: refreshReferenced } = await useFetch(() => `/api/resources/instances/${currentResourceName.value}/getByIds`, {
  method: 'POST',
  body: {
    ids,
  },
  transform: data => SuperJSON.parse(data) as ResourceInstance[],
})
onWindowFocus(refreshReferenced)

const instances = computed(() => instancesRaw.value?.filter(i => filterActive.value === 'all' || i.active === (filterActive.value === 'active')) ?? [])

const firstActive = computed(() => instances.value?.find(i => i.active))

// Selection

const selectedIds = ref<string[]>([])

const router = useRouter()

function openSelection() {
  const [id] = selectedIds.value
  if (id) {
    router.push({
      name: 'db-resources-resourceName-instances-instanceId',
      params: {
        resourceName: props.field.resourceName,
        instanceId: id,
      },
    })
  }
}
</script>

<template>
  <div class="flex w-screen divide-x divide-gray-200 dark:divide-gray-800">
    <div v-if="isMultiTypes">
      <ResourceList
        v-model:resource-name="selectedType"
        :filter-list="types => types.filter(type => resourceType.implementations?.includes(type.name))"
      >
        <template #item-trailing="{ item }">
          <div class="text-xs font-bold text-white bg-primary-500 px-1 rounded ml-auto">
            {{ countPerType[item.name] ?? 0 }}
          </div>
        </template>
      </ResourceList>
    </div>
    <div class="flex-1 w-0 flex flex-col gap-2">
      <div class="flex justify-center pt-2">
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
        v-if="instances"
        :resource-name="currentResourceName"
        :instances="instances"
        empty-placeholder="No instances referenced"
        dim-inactive-instances
        class="resource-table flex-1"
        @select="instance => selectedIds = [instance.id]"
        @dblclick="openSelection()"
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
  </div>
</template>
