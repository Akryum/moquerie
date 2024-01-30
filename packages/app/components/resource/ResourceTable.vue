<script lang="ts" setup>
import type { ResourceInstance, ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'
import type { Col, ColData } from './tableTypes.js'

const props = defineProps<{
  resourceName: string
  instances: ResourceInstance[]
  selectedInstanceIds?: string[]
  dimInactiveInstances?: boolean
  emptyPlaceholder?: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  select: [instance: ResourceInstance]
  activate: [instance: ResourceInstance]
  selectMultiple: [instances: ResourceInstance[]]
}>()

// Scroll top

const el = ref<HTMLElement | null>(null)

function scrollTop() {
  el.value?.scrollTo({
    top: 0,
  })
}

defineExpose({
  scrollTop,
})

// Resource Type

const resourceTypeStore = useResourceTypeStore()

const { data: resourceType, refresh: refreshResourceType } = await useFetch<ResourceSchemaType>(`/api/resources/${props.resourceName}`)
onWindowFocus(refreshResourceType)

// Field actions

const { data: fieldActions, refresh: refreshFieldActions } = await useFetch(`/api/fieldActions`, {
  query: {
    resourceName: props.resourceName,
  },
})
onWindowFocus(refreshFieldActions)

// Columns

const colsData: Record<string, ColData> = {}

const cols = computed(() => {
  const cols: Col[] = []

  if (resourceType.value) {
    for (const field in resourceType.value.fields) {
      const data = colsData[field]
      const fieldData = resourceType.value.fields[field]
      const fieldAction = fieldActions.value?.find(fa => fa.fieldName === field)
      cols.push({
        field,
        fieldData,
        fieldAction,
        label: field,
        size: data?.size ?? fieldData ? getDefaultColSize(fieldData) : 200,
        childResourceType: fieldData.type === 'resource' ? resourceTypeStore.getResourceType(fieldData.resourceName) : undefined,
      })
    }
  }

  return cols
})

function getDefaultColSize(fieldData: ResourceSchemaField) {
  if (fieldData.type === 'string') {
    if (fieldData.name.match(/id/)) {
      return 150
    }
    if (fieldData.name.match(/avatar|image|picture|photo/)) {
      return 100
    }
    if (fieldData.name.match(/email/)) {
      return 300
    }
  }

  if (fieldData.type === 'resource') {
    return 150
  }

  switch (fieldData.type) {
    case 'number':
      return 100
    case 'boolean':
      return 100
    default:
      return 200
  }
}

// Select

let previousSelectedInstanceId: string | null = null

function onRowClick(instance: ResourceInstance, event: MouseEvent) {
  if (event.shiftKey) {
    if (!previousSelectedInstanceId) {
      previousSelectedInstanceId = props.selectedInstanceIds?.[0] ?? null
    }

    if (!previousSelectedInstanceId) {
      previousSelectedInstanceId = instance.id
      emit('select', instance)
      return
    }

    const index = props.instances.findIndex(i => i.id === instance.id)
    const previousSelectedIndex = props.instances.findIndex(i => i.id === previousSelectedInstanceId)

    if (index < previousSelectedIndex) {
      emit('selectMultiple', props.instances.slice(index, previousSelectedIndex + 1))
    }
    else {
      emit('selectMultiple', props.instances.slice(previousSelectedIndex, index + 1))
    }
  }
  else if (event.ctrlKey || event.metaKey) {
    if (props.selectedInstanceIds?.includes(instance.id)) {
      emit('selectMultiple', props.instances.filter(i => i.id !== instance.id && props.selectedInstanceIds?.includes(i.id)))
    }
    else {
      emit('selectMultiple', [...props.instances.filter(i => props.selectedInstanceIds?.includes(i.id)), instance])
    }
    previousSelectedInstanceId = instance.id
  }
  else {
    previousSelectedInstanceId = instance.id
    emit('select', instance)
  }
}

watch(() => props.selectedInstanceIds, (value) => {
  if (value?.length === 1) {
    previousSelectedInstanceId = value[0]
  }
})
</script>

<template>
  <div
    v-if="resourceType"
    ref="el"
    class="border-t border-gray-200 dark:border-gray-800 overflow-auto"
  >
    <!-- Headers -->
    <div class="flex divide-x divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 min-w-max">
      <slot name="header-start" />

      <div v-for="i in 3" :key="i" class="w-[42px] flex-none" />

      <ResourceTableColumnHeader
        v-for="col in cols"
        :key="col.field"
        :col="col"
      />

      <slot name="header-end" />
    </div>

    <!-- Rows -->
    <div class="divide-y divide-gray-200 dark:divide-gray-800">
      <ResourceTableRow
        v-for="instance in instances"
        :key="instance.id"
        :resource-type="resourceType"
        :instance="instance"
        :cols="cols"
        :selected="selectedInstanceIds?.includes(instance.id)"
        :selected-ids="selectedInstanceIds"
        :dim="dimInactiveInstances && !instance.active"
        :readonly="readonly"
        class="last:!border-b border-gray-200 dark:border-gray-800"
        @click="onRowClick(instance, $event)"
        @dblclick="emit('activate', instance)"
      >
        <template #start>
          <slot name="row-start" :instance="instance" />
        </template>

        <template #end>
          <slot name="row-end" :instance="instance" />
        </template>
      </ResourceTableRow>
    </div>

    <!-- Empty -->
    <div v-if="!instances.length" class="p-6 flex flex-col items-center justify-center gap-2">
      <UIcon name="i-ph-database" class="w-8 h-8 opacity-10" />
      <div class="opacity-40 text-xs">
        {{ emptyPlaceholder ?? 'No instances found' }}
      </div>
    </div>
  </div>
</template>
