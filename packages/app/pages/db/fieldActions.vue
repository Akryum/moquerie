<script lang="ts" setup>
useSaveRoute({
  key: 'db.fieldActions.lastRoute',
  basePath: '/db/fieldActions',
  defaultRoute: {
    name: 'db-fieldActions-resourceName',
  },
})

useHead({
  title: 'Field actions',
})
</script>

<template>
  <SplitPane
    save-id="db.fieldActions"
    :min="8"
    :max="40"
    :default-split="12"
  >
    <template #first>
      <FieldActionResourceList />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
