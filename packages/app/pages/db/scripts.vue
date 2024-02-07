<script lang="ts" setup>
useSaveRoute({
  key: 'db.scripts.lastRoute',
  basePath: '/db/scripts',
  defaultRoute: {
    name: 'db-scripts',
  },
})

useHead({
  title: 'Scripts',
})
</script>

<template>
  <SplitPane
    save-id="db.scripts"
    :min="8"
    :max="40"
    :default-split="20"
  >
    <template #first>
      <ScriptList />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
