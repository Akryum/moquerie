<script lang="ts" setup>
import { Tooltip } from 'floating-vue'
</script>

<template>
  <Tooltip
    class="leading-[0]"
  >
    <UIcon name="i-ph-info" />

    <template #popper>
      <slot />
    </template>
  </Tooltip>
</template>
