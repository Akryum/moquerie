<script lang="ts" setup>
import type { ResourceSchemaType } from '@moquerie/core'

const route = useRoute()
const { data: resourceType, refresh } = await useFetch<ResourceSchemaType>(`/api/resources/${route.params.resourceName}`)
onWindowFocus(refresh)

const { data: ignored, refresh: refreshIgnored } = await useFetch(`/api/resources/${route.params.resourceName}/ignored`)
onWindowFocus(refreshIgnored)

const router = useRouter()

watch(ignored, (value) => {
  if (value) {
    router.replace({
      name: 'db-resources',
    })
  }
}, {
  immediate: true,
})

defineShortcuts({
  meta_shift_x: {
    usingInput: true,
    handler: () => {
      router.push({
        name: 'db-resources-resourceName-create',
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
  <div v-if="resourceType" class="flex flex-col divide-y divide-gray-300 dark:divide-gray-800">
    <div class="px-2 h-10 flex items-center gap-2">
      <ResourceInfo :type="resourceType" />

      <div class="flex-1" />

      <UButton
        v-if="$route.name !== 'db-resources-resourceName-create'"
        :to="{
          name: 'db-resources-resourceName-create',
          params: {
            ...$route.params,
          },
          query: {
            ...$route.query,
          },
        }"
        icon="i-ph-plus"
      >
        New instance
        <KbShortcut keys="meta_shift_x" />
      </UButton>
    </div>
    <div class="flex-1 overflow-y-auto">
      <NuxtPage />
    </div>
  </div>
</template>
