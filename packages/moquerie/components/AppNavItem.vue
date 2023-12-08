<script lang="ts" setup>
import { NuxtLink } from '#components'

const props = defineProps<{
  to?: any
  icon: string
  title: string
  activeRoute?: string
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
  <UTooltip
    :text="title"
    :popper="{
      placement: 'right',
    }"
  >
    <component
      :is="to ? NuxtLink : 'button'"
      :to="to"
      class="leading-[0] p-2.5 rounded-md"
      :class="[
        isActive
          ? 'bg-primary-200 text-primary-600 dark:bg-primary-900 dark:text-primary-100'
          : 'text-gray-500 dark:text-gray-300',
      ]"
    >
      <UIcon :name="icon" class="w-5 h-5" />
    </component>
  </UTooltip>
</template>
