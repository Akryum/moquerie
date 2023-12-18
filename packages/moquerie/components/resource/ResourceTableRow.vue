<script lang="ts" setup>
import { Menu, VTooltip as vTooltip } from 'floating-vue'
import type { Col } from './tableTypes.js'
import type { ResourceInstance, ResourceSchemaType } from '~/types/resource.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  instance: ResourceInstance
  cols: Col[]
  selected?: boolean
  selectedIds?: string[]
  dim?: boolean
}>()

const scrollEl = ref<HTMLElement | null>(null)

onMounted(() => {
  watchEffect(() => {
    if (props.selected && (props.selectedIds?.length ?? 0) <= 1) {
      scrollEl.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  })
})
</script>

<template>
  <div
    class="relative [&:last-child>.scroll-el]:bottom-0 select-none min-w-max"
    :class="[
      selected
        ? 'bg-primary-100 dark:bg-primary-900'
        : 'hover:bg-gray-100 dark:hover:bg-gray-900',
    ]"
    aria-role="button"
  >
    <div
      ref="scrollEl"
      class="scroll-el absolute inset-x-0 -inset-y-10 pointer-events-none"
    />

    <div
      class="flex divide-x divide-gray-200 dark:divide-gray-800"
      :class="{
        'bg-gray-500/5 dark:bg-gray-500/20': dim,
      }"
    >
      <!-- Active -->
      <div
        v-tooltip="instance.active ? 'Active' : 'Inactive'"
        class="w-[42px] flex items-center justify-center opacity-50 hover:opacity-100 flex-none"
      >
        <UIcon
          :name="instance.active ? 'i-ph-eye' : 'i-ph-eye-slash'"
        />
      </div>

      <!-- Columns -->
      <div
        v-for="col in props.cols"
        :key="col.field"
        class="px-2 h-[40px] flex items-center break-all flex-none"
        :class="{
          'opacity-50': dim,
        }"
        :style="{
          width: `${col.size}px`,
        }"
      >
        <template v-if="col.fieldData?.type === 'resource'">
          <Menu
            :delay="500"
            :dispose-timeout="0"
          >
            <template #default="{ shown }">
              <ResourceReferencesSummary
                :field="col.fieldData"
                :value="instance.value[col.field as keyof typeof instance]"
                class="border border-primary/10 px-2 py-1 rounded-lg"
                :class="{
                  'ring-2 ring-gray-500/50': shown,
                }"
              />
            </template>

            <template #popper>
              <ResourceReferencesPreview
                :field="col.fieldData"
                :value="instance.value[col.field as keyof typeof instance]"
                class="max-w-[600px] min-h-[200px] max-h-[600px] [&_.resource-table]:!border-t-0"
              />
            </template>
          </Menu>
        </template>
        <ValuePreview
          v-else
          :value="instance.value[col.field as keyof typeof instance]"
          :type="col.fieldData?.type"
          class="leading-tight text-xs line-clamp-2"
          :class="{
            'font-mono': col.fieldData?.type === 'number' || col.field.match(/id/),
          }"
        />
      </div>
    </div>
  </div>
</template>
