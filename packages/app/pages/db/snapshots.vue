<script lang="ts" setup>
useSaveRoute({
  key: 'db.snapshots.lastRoute',
  basePath: '/db/snapshots',
  defaultRoute: {
    name: 'db-snapshots',
  },
})

useHead({
  title: 'Snapshots',
})
</script>

<template>
  <SplitPane
    save-id="db.snapshots"
    :min="8"
    :max="40"
    :default-split="20"
  >
    <template #first>
      <SnapshotList />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
