<script lang="ts" setup>
import { vTooltip } from 'floating-vue'
import type { ResourceFactoryValue } from '@moquerie/core'
import type { ResourceSchemaType } from '@moquerie/core'

const props = defineProps<{
  resourceType: ResourceSchemaType
  type: string
  value: ResourceFactoryValue
}>()

const typeLabel = computed(() => {
  if (props.type === 'resource') {
    switch (props.value.generateType) {
      case 'static':
        return 'None'
      case 'resourceReference':
        return 'Resource'
    }
  }
  else {
    switch (props.value.generateType) {
      case 'static':
        return 'Static'
      case 'faker':
        return 'Faker'
    }
  }

  return null
})
</script>

<template>
  <div
    v-tooltip="typeLabel"
    class="border border-gray-200 dark:border-gray-800 rounded px-1 text-gray-600 dark:text-gray-400 flex items-baseline gap-1"
  >
    <div v-if="value.generateType === 'faker'">
      <div v-if="!value.fakerFactory" class="flex items-baseline gap-1 text-orange-500 font-sans">
        <UIcon name="i-ph-warning" class="w-4 h-4 relative top-1" />
        Generator not selected
      </div>
      <div v-else class="flex items-center gap-1">
        <UIcon name="i-ph-dice-three" class="w-4 h-4 flex-none" />
        {{ value.fakerFactory }}
      </div>
    </div>

    <div v-else-if="value.generateType === 'resourceReference'" class="flex items-center gap-1">
      <UIcon name="i-ph-database" class="w-4 h-4 flex-none" />
      {{ value.resourceTypeName ?? '-' }}
    </div>

    <div v-else-if="value.generateType === 'static'" class="max-w-[200px] truncate">
      {{ value.staticValue }}
    </div>

    <div v-else class="opacity-50 italic">
      Unknown
    </div>
  </div>
</template>
