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
      :class="{
        'bg-rose-800 text-rose-100': isActive,
      }"
    >
      <UIcon :name="icon" class="w-5 h-5" />
    </component>
  </UTooltip>
</template>
