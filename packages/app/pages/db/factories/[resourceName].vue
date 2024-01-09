<script lang="ts" setup>
import type { ResourceSchemaType } from '@moquerie/core'

const route = useRoute()

const { data, refresh } = await useFetch<ResourceSchemaType>(`/api/resources/${route.params.resourceName}`)
onWindowFocus(refresh)

const { data: ignored, refresh: refreshIgnored } = await useFetch(`/api/resources/${route.params.resourceName}/ignored`)
onWindowFocus(refreshIgnored)

const router = useRouter()

watch(ignored, (value) => {
  if (value) {
    router.replace({
      name: 'db-factories',
    })
  }
}, {
  immediate: true,
})

// New factory

defineShortcuts({
  meta_shift_x: {
    usingInput: true,
    handler: () => {
      router.push({
        name: 'db-factories-resourceName-create',
        params: {
          ...route.params,
        },
        query: {
          ...route.query,
        },
      })
    },
  },
})
</script>

<template>
  <div v-if="data" class="flex flex-col divide-y divide-gray-300 dark:divide-gray-800">
    <div class="px-2 h-10 flex items-center gap-2">
      <ResourceInfo
        :type="data"
      />

      <div class="flex-1" />

      <UButton
        v-if="$route.name !== 'db-factories-resourceName-create'"
        :to="{
          name: 'db-factories-resourceName-create',
          params: {
            ...$route.params,
          },
          query: {
            ...$route.query,
          },
        }"
        icon="i-ph-plus"
      >
        New factory
        <KbShortcut keys="meta_shift_x" />
      </UButton>
    </div>
    <div class="flex-1 h-0 flex items-stretch">
      <SplitPane
        save-id="db.factories.factory.mainPane"
        :min="8"
        :max="40"
        :default-split="12"
        class="w-full h-full"
      >
        <template #first>
          <FactoryList
            class="h-full"
          />
        </template>

        <template #last>
          <div class="flex-1 overflow-y-auto h-full">
            <NuxtPage class="w-full h-full" />
          </div>
        </template>
      </SplitPane>
    </div>
  </div>
</template>
