<script lang="ts" setup>
useSaveRoute({
  key: 'db.history.lastRoute',
  basePath: '/db/history',
  defaultRoute: {
    name: 'db-history',
  },
})

useHead({
  title: 'History',
})
</script>

<template>
  <SplitPane
    save-id="db.history"
    :min="8"
    :max="40"
    :default-split="20"
  >
    <template #first>
      <HistoryRecordList />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
