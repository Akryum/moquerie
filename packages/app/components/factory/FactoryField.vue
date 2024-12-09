<script lang="ts">
import type { ResourceFactoryField, ResourceSchemaType } from '@moquerie/core'
import type { FlatField } from './formTypes.js'
import { Dropdown } from 'floating-vue'
import { isAnyOpen } from '../resource/resourceInstanceValueOverlays.js'

export const selectedField = ref<string | null>(null)

const hoverField = ref<FlatField | null>(null)
</script>

<script lang="ts" setup>
const props = defineProps<{
  flatField: FlatField
  rootResourceType: ResourceSchemaType
  fakerLocale?: string
}>()

const emit = defineEmits<{
  'update:factoryField': [factoryField: ResourceFactoryField]
}>()

const el = ref<HTMLElement>()

const field = computed(() => props.flatField.field)

const isOpen = ref(false)

watch(isOpen, (val) => {
  if (val) {
    selectedField.value = props.flatField.fullKey
    el.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }
})

watch(selectedField, (val) => {
  isOpen.value = val === props.flatField.fullKey
})

// Hover (help with nested fields visualization)

const hoverEffectShown = computed(() => {
  if (!hoverField.value) {
    return false
  }

  const hoverFieldParent = hoverField.value.parent
  function checkParent(flatField: FlatField | null): boolean {
    if (!flatField) {
      return false
    }

    if (flatField.fullKey === hoverField.value?.fullKey || flatField.fullKey === hoverFieldParent?.fullKey) {
      return true
    }

    return checkParent(flatField.parent)
  }
  return checkParent(props.flatField)
})
</script>

<template>
  <Dropdown
    v-model:shown="isOpen"
    placement="right"
    :distance="12"
    :dispose-timeout="0"
    shift-cross-axis
    instant-move
    :auto-hide="!isAnyOpen"
    popper-class="no-overflow"
  >
    <div
      ref="el"
      tabindex="0"
      aria-role="button"
      class="w-full h-[40px] ring-2 ring-transparent hover:bg-gray-500/5 cursor-pointer relative"
      :class="{
        '!ring-primary rounded-lg': isOpen,
      }"
      @keydown.enter="isOpen = true"
      @mouseenter="hoverField = flatField"
      @mouseleave="hoverField = null"
    >
      <div
        v-if="hoverEffectShown"
        class="absolute top-0 left-0 h-full w-0.5 bg-primary-500/40"
      />

      <div class="relative px-2 h-full">
        <div
          class="flex items-center gap-2 h-full"
          :style="{
            paddingLeft: `${(flatField.depth ?? 0) * 1.5}rem`,
          }"
        >
          <template v-if="flatField.key !== flatField.parent?.key">
            <div class="text-primary-500 flex items-center gap-1">
              {{ field.name }}

              <ResourceFieldInfoIcons
                :field="field"
                :resource-type="flatField.resourceType"
                :child-resource-type="flatField.childResourceType"
              />
            </div>
            <div v-if="field.description" class="text-sm text-gray-500 dark:text-gray-400 truncate flex-shrink">
              {{ field.description }}
            </div>
          </template>
          <UIcon
            v-else
            name="i-ph-arrow-elbow-down-right"
            class="w-4 h-4 flex-none text-primary-500"
          />

          <FactoryFieldSummary
            :factory-field="flatField.factoryField"
            :root-resource-type="rootResourceType"
          />
        </div>
      </div>
    </div>

    <template #popper>
      <div class="p-2 space-y-2">
        <div class="flex items-center gap-2">
          <div class="text-primary-500 flex-1 flex items-center gap-1">
            {{ field.name }}

            <ResourceFieldInfoIcons
              :field="field"
              :resource-type="flatField.resourceType"
              :child-resource-type="flatField.childResourceType"
            />
          </div>

          <div>
            <UKbd>⇧</UKbd>
            +
            <UKbd>↑</UKbd>
            /
            <UKbd>↓</UKbd>
          </div>
        </div>
        <FactoryFieldInput
          :flat-field="flatField"
          :root-resource-type="rootResourceType"
          :faker-locale="fakerLocale"
          @update:factory-field="emit('update:factoryField', $event)"
        />
      </div>
    </template>
  </Dropdown>
</template>
