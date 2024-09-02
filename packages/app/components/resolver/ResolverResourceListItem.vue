<script lang="ts" setup>
const props = defineProps<{
  name: string
  count: number
}>()

const icon = computed(() => {
  if (props.name.match(/query|mutation|subscription/i)) {
    return 'i-ph-brackets-curly'
  }
  if (props.name.match(/team|organization|users/i)) {
    return 'i-ph-users'
  }
  if (props.name.match(/user/i)) {
    return 'i-ph-user'
  }
  return 'i-ph-database'
})
</script>

<template>
  <LinkListItem
    :to="{
      name: 'db-resolvers-resourceName',
      params: {
        resourceName: name,
      },
    }"
    :icon="icon"
  >
    <div class="flex items-center gap-1">
      <div class="text-sm truncate flex-1 w-0">
        {{ name }}
      </div>

      <div
        class="text-xs font-mono"
        :class="[
          count === 0
            ? 'opacity-50'
            : 'text-primary-500',
        ]"
      >
        {{ count }}
      </div>
    </div>
  </LinkListItem>
</template>
