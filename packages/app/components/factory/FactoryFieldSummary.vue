<script lang="ts" setup>
import { vTooltip } from 'floating-vue'
import type { ResourceFactoryField, ResourceSchemaType } from '@moquerie/core'

const props = defineProps<{
  factoryField: ResourceFactoryField
  rootResourceType: ResourceSchemaType
}>()

const typeLabel = computed(() => {
  switch (props.factoryField.type) {
    case 'null':
      return 'None'
    case 'db':
      return 'Resource'
    case 'other':
      return 'Other'
    case 'faker':
      return 'Faker'
  }

  return null
})
</script>

<template>
  <div
    v-tooltip="typeLabel"
    class="text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-end gap-1"
  >
    <div v-if="factoryField.type === 'faker'">
      <div v-if="!factoryField.fakerFn" class="flex items-baseline gap-1 text-orange-500 font-sans">
        <UIcon name="i-ph-warning" class="w-4 h-4 relative top-1" />
        Generator not selected
      </div>
      <div v-else class="flex items-center gap-1 font-mono text-sm">
        <UIcon name="i-ph-dice-three" class="w-4 h-4 flex-none" />
        {{ factoryField.fakerFn }}
      </div>
    </div>

    <div v-else-if="factoryField.type === 'db'" class="flex items-center justify-end gap-1 flex-1 w-0">
      <UIcon name="i-ph-database" class="w-4 h-4 flex-none" />
      <div class="w-min truncate">
        <span v-if="factoryField.dbFn" class="font-mono text-sm">
          {{ factoryField.dbResource }}.{{ factoryField.dbFn }}({{ factoryField.dbParams ?? '' }})
        </span>
        <template v-else>
          {{ factoryField.dbResource }}
          <span class="text-primary-500">
            {{ factoryField.dbReferences?.length ?? 0 }}
          </span>
        </template>
      </div>
    </div>

    <div v-else-if="factoryField.type === 'repeat'" class="flex items-center gap-1">
      <UIcon name="i-ph-repeat" class="w-4 h-4 flex-none" />
      Repeat ({{ factoryField.repeatMin ?? 0 }} to {{ factoryField.repeatMax ?? 0 }} times)
    </div>

    <div v-else-if="factoryField.type === 'pickRandom'" class="flex items-center gap-1">
      <UIcon name="i-ph-hand-tap" class="w-4 h-4 flex-none" />
      Pick random
    </div>

    <div v-else-if="factoryField.type === 'array'" class="flex items-center gap-1">
      <UIcon name="i-ph-brackets-square" class="w-4 h-4 flex-none" />
      Array
      <span class="text-primary-500">
        {{ factoryField.arrayChildren?.length ?? factoryField.dbReferences?.length ?? 0 }}
      </span>
    </div>

    <div v-else-if="factoryField.type === 'object'" class="flex items-center gap-1">
      <UIcon name="i-ph-brackets-curly" class="w-4 h-4 flex-none" />
      Inline object
    </div>

    <template v-else-if="factoryField.type === 'other'">
      <div v-if="factoryField.lazyBody === 'rootRef'" class="flex items-center gap-1">
        <UIcon name="i-ph-stack-simple" class="w-4 h-4 flex-none" />
        Created {{ rootResourceType.name }} reference
      </div>
      <div v-else class="max-w-[200px] truncate font-mono text-sm text-green-500">
        {{ factoryField.rawCode ?? factoryField.value }}
      </div>
    </template>

    <div v-else-if="factoryField.type === 'null'" class="opacity-50">
      None
    </div>

    <div v-else class="opacity-50 italic">
      Unknown
    </div>
  </div>
</template>
