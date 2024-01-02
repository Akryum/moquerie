<script lang="ts" setup>
useSaveRoute({
  key: 'graphql.lastRoute',
  basePath: '/graphql',
  defaultRoute: {
    name: 'graphql-schema',
  },
})

useHead({
  titleTemplate: title => title ? `GraphQL ${title}` : 'GraphQL',
})
</script>

<template>
  <div class="flex divide-x divide-gray-300 dark:divide-gray-700">
    <UVerticalNavigation
      :links="[
        {
          label: 'Schema',
          to: '/graphql/schema',
          icon: 'i-ph-tree-structure',
        },
        {
          label: 'Playground',
          to: '/graphql/playground',
          icon: 'i-ph-play',
        },
      ]"
      class="m-1 min-w-[160px]"
    />
    <NuxtPage class="w-full h-full" />
  </div>
</template>
