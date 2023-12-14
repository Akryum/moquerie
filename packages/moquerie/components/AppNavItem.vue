<script lang="ts" setup>
import { Tooltip } from 'floating-vue'
import { NuxtLink } from '#components'

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
    class=""
  >
    <component
      :is="to ? NuxtLink : 'button'"
      :to="to"
      class="leading-[0] p-2.5 block rounded-md hover:text-primary-500 hover:bg-primary-50 hover:dark:bg-primary-950"
      :class="[
        isActive
          ? '!bg-primary-200 dark:!bg-primary-900 dark:text-primary-100'
          : 'text-gray-500 dark:text-gray-300',
      ]"
    >
      <UIcon :name="icon" class="w-5 h-5" />
    </component>

    <template #popper>
      <div class="flex items-center gap-4">
        <span class="text-xs">{{ title }}</span>
        <KbShortcut v-if="shortcuts" :keys="shortcuts" />
      </div>
    </template>
  </Tooltip>
</template>
