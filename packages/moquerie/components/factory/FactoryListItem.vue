<script lang="ts" setup>
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
    <div class="truncate">
      {{ factory.name }}
    </div>
  </LinkListItem>
</template>
