<script lang="ts" setup>
import type { ResourceSchemaType } from '~/types'

const props = defineProps<{
  resourceType: ResourceSchemaType
  routeName: string
  hover?: boolean
  showShortcut?: boolean
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
        name: routeName,
        params: {
          resourceName: resourceType.name,
        },
      }"
      class="flex items-center gap-2 px-2 py-1.5 mx-1 my-0.5 rounded"
      :class="{
        'text-primary-500 bg-primary-50 dark:bg-primary-950': hover,
      }"
      active-class="!bg-primary-100 dark:!bg-primary-900"
    >
      <UIcon :name="icon" class="flex-none w-4 h-4 opacity-80" />

      <div class="flex-1">
        <div class="text-sm">
          {{ resourceType.name }}
        </div>
      </div>

      <UKbd v-if="showShortcut">
        ↵
      </UKbd>
    </NuxtLink>
  </div>
</template>
