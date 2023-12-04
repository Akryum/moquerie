<script lang="ts" setup>
useSaveRoute({
  key: 'db.factories.lastRoute',
  defaultRoute: {
    name: 'db-factories-resourceName',
  },
})
</script>

<template>
  <SplitPane
    save-id="db.factories"
    :min="8"
    :max="40"
    :default-split="12"
  >
    <template #first>
      <ResourceList
        route-name="db-factories-resourceName"
      />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
