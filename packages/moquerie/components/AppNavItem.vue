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
  if (!props.activeRoute) {
    return false
  }

  if (props.activeRoute === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(props.activeRoute)
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
          ? 'bg-rose-200 text-rose-600 dark:bg-rose-700 dark:text-rose-100'
          : 'text-gray-500 dark:text-gray-300',
      ]"
    >
      <UIcon :name="icon" class="w-5 h-5" />
    </component>
  </UTooltip>
</template>
