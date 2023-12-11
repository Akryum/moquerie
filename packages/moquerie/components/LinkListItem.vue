<script lang="ts" setup>
import { Tooltip } from 'floating-vue'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: string | RouteLocationRaw
  icon?: string
  hover?: boolean
  showShortcut?: boolean
}>()

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
    <Tooltip
      placement="right"
      :delay="{ show: 300, hide: 0 }"
      :disabled="!$slots.tooltip"
    >
      <NuxtLink
        :to="to"
        class="flex items-center gap-2 px-2 py-1.5 mx-1 my-0.5 rounded"
        :class="{
          'text-primary-500 bg-primary-50 dark:bg-primary-950': hover,
        }"
        active-class="!bg-primary-100 dark:!bg-primary-900"
      >
        <UIcon v-if="icon" :name="icon" class="flex-none w-4 h-4 opacity-80" />

        <div class="flex-1 w-0">
          <slot />
        </div>

        <UKbd v-if="showShortcut">
          ↵
        </UKbd>
      </NuxtLink>

      <template #popper>
        <slot name="tooltip" />
      </template>
    </Tooltip>
  </div>
</template>
