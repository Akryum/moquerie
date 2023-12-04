<script lang="ts" setup>
useSaveRoute('db.resources.lastRoute')
</script>

<template>
  <SplitPane
    save-id="db.resources"
    :min="8"
    :max="40"
    :default-split="12"
  >
    <template #first>
      <ResourceList />
    </template>

    <template #last>
      <NuxtPage class="w-full h-full" />
    </template>
  </SplitPane>
</template>
