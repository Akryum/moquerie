<script lang="ts">
import { Dropdown, VTooltip as vTooltip } from 'floating-vue'
import { isAnyOpen } from '../resource/resourceInstanceValueOverlays.js'
import type { ResourceFactoryValue } from '~/types/factory.js'
import type { ResourceSchemaField, ResourceSchemaType } from '~/types/resource.js'

export const selectedField = ref<string | null>(null)
</script>

<script lang="ts" setup>
const props = defineProps<{
  resourceType: ResourceSchemaType
  field: ResourceSchemaField
  value: ResourceFactoryValue
  fakerLocale?: string
}>()

const emit = defineEmits<{
  'update:value': [ResourceFactoryValue]
}>()

const el = ref<HTMLElement>()

const isOpen = ref(false)

watch(isOpen, (val) => {
  if (val) {
    selectedField.value = props.field.name
    el.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }
})

watch(selectedField, (val) => {
  if (val === props.field.name) {
    isOpen.value = true
  }
  else {
    isOpen.value = false
  }
})
</script>

<template>
  <Dropdown
    v-model:shown="isOpen"
    placement="left"
    popper-class="no-overflow"
    :dispose-timeout="0"
    shift-cross-axis
    instant-move
    :auto-hide="!isAnyOpen"
  >
    <div
      ref="el"
      tabindex="0"
      aria-role="button"
      class="w-full h-[40px] p-1 border-2 border-transparent rounded-lg hover:bg-gray-500/5 cursor-pointer"
      :class="{
        '!border-primary': isOpen,
      }"
      @keydown.enter="isOpen = true"
    >
      <div class="flex items-baseline gap-2">
        <div class="text-primary-500 flex items-center gap-1">
          {{ field.name }}

          <UIcon v-if="field.array" v-tooltip="'Array'" name="i-ph-circles-three" />
          <UIcon v-else-if="field.type === 'resource'" v-tooltip="'Single reference'" name="i-ph-number-circle-one" />
        </div>
        <div v-if="field.description" class="text-sm text-gray-500 dark:text-gray-400 truncate flex-shrink">
          {{ field.description }}
        </div>

        <div class="flex-1" />

        <FactoryValueSummary
          :resource-type="resourceType"
          :type="field.type"
          :value="value"
        />
      </div>
    </div>

    <template #popper>
      <div class="p-2 space-y-2">
        <div class="flex items-center gap-2">
          <div class="text-primary-500 flex-1 flex items-center gap-1">
            {{ field.name }}
            <UIcon v-if="field.array" v-tooltip="'Array'" name="i-ph-circles-three" />
            <UIcon v-else-if="field.type === 'resource'" v-tooltip="'Single reference'" name="i-ph-number-circle-one" />
          </div>

          <div>
            <UKbd>⇧</UKbd>
            +
            <UKbd>↑</UKbd>
            /
            <UKbd>↓</UKbd>
          </div>
        </div>
        <FactoryValueInput
          :resource-type="resourceType"
          :field="field"
          :type="field.type"
          :value="value"
          :array="field.array"
          :faker-locale="fakerLocale"
          @update:value="emit('update:value', $event)"
        />
      </div>
    </template>
  </Dropdown>
</template>
