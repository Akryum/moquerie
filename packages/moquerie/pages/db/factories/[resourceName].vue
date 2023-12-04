<script lang="ts" setup>
const route = useRoute()

const { data, refresh } = await useFetch(`/api/resources/${route.params.resourceName}`)
onWindowFocus(refresh)
</script>

<template>
  <div v-if="data" class="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
    <div class="px-2 py-1 flex items-center gap-2">
      <div>{{ data.name }}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400 flex-shrink truncate">
        {{ data.description }}
      </div>
      <div class="flex gap-1">
        <UBadge
          v-for="tag in data.tags"
          :key="tag"
          variant="soft"
        >
          {{ tag }}
        </UBadge>
      </div>

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
