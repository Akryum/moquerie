<script lang="ts" setup>
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 overflow-auto flex">
    <div class="fixed inset-0" @click="$emit('update:modelValue', false)" />

    <div class="mx-auto bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg w-screen md:max-w-[600px] h-min mt-1 relative drop-shadow-xl">
      <slot />
    </div>
  </div>
</template>
