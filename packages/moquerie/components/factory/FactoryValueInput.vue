<script lang="ts" setup>
import type { ResourceFactoryValue } from '~/types/factory.js'
import type { ResourceSchemaType } from '~/types/resource.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  type: string
  value: ResourceFactoryValue
  array?: boolean
  fakerLocale?: string
}>()

const emit = defineEmits<{
  'update:value': [ResourceFactoryValue]
}>()

const generateTypeItems = computed(() => {
  const list = []

  if (props.type === 'resource') {
    list.push({
      value: 'static',
      label: 'None',
    }, {
      value: 'resourceReference',
      label: 'Resource',
    })
  }
  else {
    list.push({
      value: 'static',
      label: 'Static',
    }, {
      value: 'faker',
      label: 'Faker',
    })
    // @TODO registeredFunction | importFunction
  }

  return list
})

function selectGenerateType(index: number) {
  const selected = generateTypeItems.value[index]
  if (selected && props.value) {
    const newValue: ResourceFactoryValue = {
      ...props.value,
      generateType: selected.value as any,
    }
    emit('update:value', newValue)
  }
}

function update(updated: Partial<ResourceFactoryValue>) {
  const newValue: ResourceFactoryValue = {
    ...props.value,
    ...updated,
  }
  emit('update:value', newValue)
}
</script>

<template>
  <div class="w-[400px]">
    <UTabs
      :model-value="generateTypeItems.findIndex(item => item.value === value?.generateType)"
      :items="generateTypeItems"
      @update:model-value="selectGenerateType"
    />

    <div v-if="value.generateType === 'static'">
      <div class="p-2 flex items-center gap-2">
        <UToggle
          :model-value="value.staticEvaluated ?? false"
          @update:model-value="update({ staticEvaluated: $event })"
        />
        Evaluate as JavaScript
      </div>

      <UTextarea
        v-if="!value.staticEvaluated"
        :model-value="value.staticValue ?? ''"
        :ui="{
          base: 'h-[200px]',
        }"
        @update:model-value="update({ staticValue: $event })"
      />

      <MonacoEditor
        v-else
        :filename="`field-${resourceType.name}-edit.js`"
        :source="value.staticValue ?? ''"
        :options="{
          language: 'javascript',
          lineNumbers: 'off',
          folding: false,
        }"
        class="h-[200px] border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden"
        @update:source="update({ staticValue: $event })"
      />
    </div>

    <div v-else-if="value.generateType === 'faker'">
      <FactoryFakerInput
        :resource-type="resourceType"
        :type="type"
        :value="value"
        :array="array"
        :faker-locale="fakerLocale"
        @update:value="update"
      />
    </div>

    <div v-else-if="value.generateType === 'resourceReference'" class="space-y-2">
      <!-- @TODO support interface / selecting different types -->
      <div class="px-2 py-1 border border-gray-200 dark:border-gray-800 rounded flex items-center gap-1">
        <UIcon name="i-ph-database" />
        {{ value.resourceTypeName }}
      </div>

      <div class="p-2 flex items-center gap-2">
        <UToggle
          :model-value="value.resourceRandom ?? false"
          @update:model-value="update({ resourceRandom: $event })"
        />
        Select random instance
      </div>
    </div>

    <div v-else class="flex items-end justify-center p-6 gap-4">
      <UIcon name="i-ph-arrow-bend-left-up" class="w-10 h-10 flex-none text-primary-500" />
      <p>Select a generate type to continue</p>
    </div>
  </div>
</template>
