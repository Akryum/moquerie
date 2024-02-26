<script lang="ts" setup>
import type { ResourceSchemaType } from '@moquerie/core'

const props = defineProps<{
  resourceType: ResourceSchemaType
  routeName?: string
}>()

const icon = computed(() => {
  if (props.resourceType.name.match(/query|mutation|subscription/i)) {
    return 'i-ph-brackets-curly'
  }
  if (props.resourceType.name.match(/team|organization|users/i)) {
    return 'i-ph-users'
  }
  if (props.resourceType.name.match(/user/i)) {
    return 'i-ph-user'
  }
  return 'i-ph-database'
})
</script>

<template>
  <LinkListItem
    :to="routeName ? {
      name: routeName,
      params: {
        resourceName: resourceType.name,
      },
    } : undefined"
    :icon="icon"
  >
    <div class="flex items-center">
      <div
        class="text-sm truncate"
        :class="{
          'line-through': resourceType.isDeprecated,
        }"
      >
        {{ resourceType.name }}
      </div>
      <slot name="trailing" />
    </div>

    <template #tooltip>
      <div class="flex flex-col gap-1">
        <ResourceInfo
          :type="resourceType"
        />
      </div>
    </template>
  </LinkListItem>
</template>
