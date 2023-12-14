<script lang="ts" setup generic="TValue = any">
interface Option {
  value: TValue
  label: string
  icon?: string
}

defineProps<{
  modelValue: TValue
  options: Option[]
  buttonAttrs?: Record<string, any>
}>()

defineEmits<{
  'update:modelValue': [TValue]
}>()
</script>

<template>
  <UButtonGroup>
    <UButton
      v-for="(option, index) in options"
      :key="index"
      v-bind="buttonAttrs"
      :variant="option.value === modelValue ? 'solid' : 'outline'"
      :ui="{
        color: {
          gray: {
            solid: 'bg-primary-200 hover:bg-primary-300 dark:bg-primary-800 dark:hover:bg-primary-700 ring-gray-300 dark:ring-gray-700 text-primary-900',
            outline: 'ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 disabled:bg-transparent dark:hover:bg-gray-800 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400',
          },
        },
      }"
      :class="{
        'flex-1': buttonAttrs?.block,
      }"
      @click="$emit('update:modelValue', option.value)"
    >
      <UIcon
        v-if="option.icon"
        :name="option.icon"
        class="w-4 h-4 flex-none"
      />
      {{ option.label }}
    </UButton>
  </UButtonGroup>
</template>
