<script lang="ts" setup>
import { NuxtLink } from '#components'
import { Tooltip } from 'floating-vue'

const props = defineProps<{
  to?: any
  icon: string
  title: string
  activeRoute?: string
  shortcuts?: string | string[]
}>()

const route = useRoute()

const isActive = computed(() => {
  let activeRoute = props.activeRoute

  if (!activeRoute && typeof props.to === 'string') {
    activeRoute = props.to
  }

  if (!activeRoute) {
    return false
  }

  if (activeRoute === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(activeRoute)
})
</script>

<template>
  <Tooltip
    placement="right"
    :disabled="!title && !shortcuts"
    class="relative"
  >
    <component
      :is="to ? NuxtLink : 'button'"
      :to="to"
      class="leading-[0] p-2.5 block hover:text-primary-500 dark:hover:text-gray-300"
      :class="[
        isActive
          ? 'text-primary-700 dark:text-white'
          : 'text-gray-400 dark:text-gray-500',
      ]"
    >
      <UIcon :name="icon" class="w-6 h-6" />
    </component>

    <div
      v-if="isActive"
      class="absolute inset-y-2 left-0 w-[3px] rounded-r bg-primary-700 dark:bg-white"
    />

    <template #popper>
      <div class="flex items-center gap-4">
        <span class="text-xs">{{ title }}</span>
        <KbShortcut v-if="shortcuts" :keys="shortcuts" />
      </div>
    </template>
  </Tooltip>
</template>
