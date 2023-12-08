<script lang="ts" setup>
const props = defineProps<{
  value: any
}>()

const type = computed(() => {
  if (typeof props.value === 'string') {
    if (props.value.startsWith('http')) {
      if (props.value.match(/\.(png|jpe?g|gif|svg|webp)$/) || props.value.includes('avatar')) {
        return 'image'
      }
      return 'url'
    }
  }

  return typeof props.value
})
</script>

<template>
  <img v-if="type === 'image'" :src="value" class="object-contain">
  <a v-else-if="type === 'url'" :href="value" target="_blank" class="text-primary-500 hover:underline">{{ value }}</a>
  <div v-else-if="type === 'boolean'" class="inline-flex items-center gap-2">
    <UIcon
      :name="value ? 'i-ph-check-circle text-green-500' : 'i-ph-circle'"
      class="w-4 h-4 flex-none"
    />
    <span>{{ value }}</span>
  </div>
  <span v-else>{{ value }}</span>
</template>
