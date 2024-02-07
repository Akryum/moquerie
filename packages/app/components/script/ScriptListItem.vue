<script lang="ts" setup>
import type { ScriptItem } from '@moquerie/core'

defineProps<{
  script: ScriptItem
}>()
</script>

<template>
  <LinkListItem
    :to="{
      name: 'db-scripts-scriptId',
      params: {
        ...$route.params,
        scriptId: script.id,
      },
      query: {
        ...$route.query,
      },
    }"
  >
    <div class="flex items-center gap-1">
      <div>
        {{ script.id }}
      </div>
      <div v-if="script.description" class="text-xs opacity-50 text-right flex-1 w-0 truncate">
        {{ script.description }}
      </div>
    </div>
  </LinkListItem>
</template>
