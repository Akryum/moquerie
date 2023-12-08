<script lang="ts" setup>
import type { ResourceFactory } from '~/types/factory.js'

defineProps<{
  factory: ResourceFactory
}>()
</script>

<template>
  <NuxtLink
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
    class="flex items-center gap-2 px-2 py-1.5 mx-1 my-0.5 rounded"
    active-class="!bg-primary-100 dark:!bg-primary-900"
  >
    {{ factory.name }}
  </NuxtLink>
</template>
