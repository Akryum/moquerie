<script lang="ts" setup>
useSaveRoute({
  key: 'db.resources.lastRoute',
  defaultRoute: {
    name: 'db-resources-resourceName',
  },
})

useHead({
  title: 'Resources',
})
</script>

<template>
  <SplitPane
    save-id="db.resources"
    :min="8"
    :max="40"
    :default-split="12"
  >
    <template #first>
      <ResourceList
        route-name="db-resources-resourceName"
      />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
