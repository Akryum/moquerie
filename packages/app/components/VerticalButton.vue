<script lang="ts" setup>
import { Tooltip } from 'floating-vue'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  icon: string
  tooltip?: string
  shortcut?: string
}>()
</script>

<template>
  <Tooltip
    :disabled="!shortcut && !tooltip && !$slots.tooltip"
  >
    <UButton
      color="gray"
      variant="ghost"
      block
      v-bind="$attrs"
    >
      <div class="flex flex-col gap-0.5 items-center">
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <UIcon :name="icon" class="w-4 h-4" />
        </div>
        <slot />
      </div>
    </UButton>

    <template #popper>
      <div class="flex flex-col gap-1">
        {{ tooltip }}
        <slot name="tooltip" />
        <KbShortcut v-if="shortcut" :keys="shortcut" />
      </div>
    </template>
  </Tooltip>
</template>
