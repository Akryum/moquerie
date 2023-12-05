<script lang="ts" setup>
const route = useRoute()

const { data, refresh } = await useFetch(`/api/resources/${route.params.resourceName}`)
onWindowFocus(refresh)
</script>

<template>
  <div v-if="data" class="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
    <div class="px-2 py-1 flex items-center gap-2">
      <ResourceToolbarInfo
        :type="data"
      />

      <div class="flex-1" />

      <UButton
        icon="i-ph-plus"
      >
        New factory
      </UButton>
    </div>
    <div class="flex-1 flex items-stretch">
      <SplitPane
        save-id="db.factories.factory.mainPane"
        :min="8"
        :max="40"
        :default-split="12"
        class="w-full h-full"
      >
        <template #first>
          <FactoryList />
        </template>

        <template #last>
          <div class="flex-1 overflow-y-auto">
            <NuxtPage class="w-full h-full" />
          </div>
        </template>
      </SplitPane>
    </div>
  </div>
</template>
