<script lang="ts" setup>
import { Tooltip } from 'floating-vue'
import type { ResourceFactory } from '~/types/factory.js'

defineProps<{
  factory: ResourceFactory
}>()
</script>

<template>
  <LinkListItem
    :to="{
      name: 'db-factories-resourceName-view-factoryId',
      params: {
        ...$route.params,
        factoryId: factory.id,
      },
      query: {
        ...$route.query,
      },
    }"
  >
    <div class="h-[40px] flex flex-col items-stretch justify-center">
      <div class="text-sm leading-tight truncate">
        {{ factory.name }}
      </div>
      <div
        v-if="factory.description"
        class="text-xs opacity-50 leading-tight truncate"
      >
        {{ factory.description }}
      </div>
    </div>

    <template #tooltip>
      <div class="flex flex-col gap-1">
        <FactoryInfo
          :factory="factory"
        />
      </div>
    </template>
  </LinkListItem>
</template>
