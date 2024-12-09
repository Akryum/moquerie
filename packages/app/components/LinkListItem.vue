<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import { NuxtLink } from '#components'
import { Tooltip } from 'floating-vue'

const props = defineProps<{
  to?: string | RouteLocationRaw
  icon?: string
  hover?: boolean
  selected?: boolean
  showShortcut?: boolean
  ui?: {
    button?: any
  }
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()

const el = ref<HTMLElement | null>(null)

function scrollIntoView(center = false, smooth = true) {
  el.value?.scrollIntoView({
    behavior: smooth ? 'smooth' : 'instant',
    block: center ? 'center' : 'nearest',
  })
}

watch(() => props.hover, (val) => {
  if (val) {
    scrollIntoView()
  }
})

onMounted(() => {
  if (props.selected) {
    setTimeout(() => {
      scrollIntoView(true, false)
    }, 300)
  }
})
</script>

<template>
  <div ref="el" class="my-0.5">
    <Tooltip
      placement="right"
      :delay="{ show: 300, hide: 0 }"
      :disabled="!$slots.tooltip"
    >
      <component
        :is="to ? NuxtLink : 'button'"
        :to="to"
        class="flex items-center gap-2 px-2 py-1.5 rounded w-full text-left"
        :class="{
          'text-primary-500 bg-primary-50 dark:bg-primary-950': hover,
          '!bg-primary-100 dark:!bg-primary-900': selected,
        }"
        active-class="!bg-primary-100 dark:!bg-primary-900"
        v-bind="ui?.button"
        @click="$emit('click', $event)"
      >
        <UIcon v-if="icon" :name="icon" class="flex-none w-4 h-4 opacity-80" />

        <div class="flex-1 w-0">
          <slot />
        </div>

        <KbShortcut v-if="showShortcut" :keys="['enter']" />
      </component>

      <template #popper>
        <slot name="tooltip" />
      </template>
    </Tooltip>
  </div>
</template>
