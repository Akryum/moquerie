<script lang="ts" setup>
import type { ResourceSchemaType } from '@moquerie/core'
import { Tooltip } from 'floating-vue'

const route = useRoute()

const resourceName = computed(() => String(route.params.resourceName))

const { data: resourceType, refresh } = await useFetch<ResourceSchemaType>(`/api/resources/${resourceName.value}`)
onWindowFocus(refresh)

const { data: ignored, refresh: refreshIgnored } = await useFetch(`/api/resources/${resourceName.value}/ignored`)
onWindowFocus(refreshIgnored)

const router = useRouter()

// If the resource is ignored, redirect to the resources page

watch(ignored, (value) => {
  if (value) {
    router.replace({
      name: 'db-resources',
    })
  }
}, {
  immediate: true,
})

// Favorite

const { isFavorite, toggleFavorite } = await useFavoriteResources()

defineShortcuts({
  meta_f: {
    usingInput: true,
    handler: () => {
      toggleFavorite(resourceName.value)
    },
  },
})

// New instance

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

      <Tooltip>
        <UButton
          :icon="isFavorite(resourceName) ? 'i-ph-star-fill' : 'i-ph-star'"
          color="gray"
          @click="toggleFavorite(resourceName)"
        />

        <template #popper>
          <div>
            {{ isFavorite(resourceName) ? 'Remove from favorites' : 'Add to favorites' }}
          </div>
          <KbShortcut keys="meta_f" />
        </template>
      </Tooltip>

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
