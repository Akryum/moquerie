<script lang="ts" setup>
const route = useRoute()
const resourceName = () => route.params.resourceName as string
</script>

<template>
  <SplitPane
    save-id="db.resources.instances"
    :default-split="80"
    :min="60"
    class="w-full h-full"
  >
    <template #first>
      <ResourceMainTable
        :resource-name="resourceName()"
        class="w-full h-full"
      />
    </template>

    <template #last>
      <NuxtPage
        class="w-full h-full"
      />
    </template>
  </SplitPane>
</template>
