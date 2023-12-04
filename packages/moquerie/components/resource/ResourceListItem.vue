<script lang="ts" setup>
import type { ResourceSchemaType } from '~/types'

const props = defineProps<{
  resourceType: ResourceSchemaType
  hover?: boolean
}>()

const icon = computed(() => {
  if (props.resourceType.name.match(/query|mutation|subscription/i)) {
    return 'i-ph-brackets-curly'
  }
  if (props.resourceType.name.match(/team|organization|users/i)) {
    return 'i-ph-users'
  }
  if (props.resourceType.name.match(/user/i)) {
    return 'i-ph-user'
  }
  return 'i-ph-square'
})

const el = ref<HTMLElement | null>(null)

watch(() => props.hover, (val) => {
  if (val) {
    el.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }
})
</script>

<template>
  <div ref="el">
    <NuxtLink
      :to="{
        name: 'db-resources-name',
        params: {
          name: resourceType.name,
        },
      }"
      class="flex items-center gap-2 p-2"
      :class="{
        'text-primary-500 bg-primary-50 dark:bg-primary-950': hover,
      }"
      active-class="!bg-primary-100 dark:!bg-primary-900"
    >
      <UIcon :name="icon" class="flex-none w-6 h-6 opacity-80" />
      <div>
        <div class="text-sm">
          {{ resourceType.name }}
        </div>
        <div class="text-xs">
          {{ resourceType.description ?? '' }}
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
