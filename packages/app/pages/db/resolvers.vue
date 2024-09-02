<script lang="ts" setup>
useSaveRoute({
  key: 'db.resolvers.lastRoute',
  basePath: '/db/resolvers',
  defaultRoute: {
    name: 'db-resolvers-resourceName',
  },
})

useHead({
  title: 'Resolvers',
})
</script>

<template>
  <SplitPane
    save-id="db.resolvers"
    :min="8"
    :max="40"
    :default-split="12"
  >
    <template #first>
      <ResolverResourceList />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
