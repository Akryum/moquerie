<script lang="ts" setup>
import { VTooltip as vTooltip } from 'floating-vue'
import type { ResourceInstance } from '~/types/resource.js'

const props = defineProps<{
  instance: ResourceInstance
}>()

const factoryStore = useFactoryStore()
const factory = props.instance.factoryId ? await factoryStore.fetchFactory(props.instance.factoryId) : null
</script>

<template>
  <div>
    <div class="text-sm [&>*]:p-1">
      <div class="flex items-center gap-1">
        <UIcon name="i-ph-database" class="w-4 h-4" />
        <span>{{ instance.resourceName }}</span>
        <span class="text-primary-500">{{ instance.id }}</span>
      </div>
      <div class="flex items-center gap-1">
        <UIcon name="i-ph-calendar-blank" class="w-4 h-4" />
        Created {{ instance.createdAt.toLocaleString() }}
      </div>
      <div class="!pl-6">
        Updated {{ instance.updatedAt?.toLocaleString() ?? '-' }}
      </div>

      <!-- Factory -->
      <NuxtLink
        v-if="factory"
        v-tooltip="'Open factory'"
        :to="{
          name: 'db-factories-resourceName-view-factoryId',
          params: {
            resourceName: instance.resourceName,
            factoryId: factory.id,
          },
        }"
        class="flex items-center gap-1 hover:text-primary hover:bg-primary/5 rounded"
      >
        <UIcon name="i-ph-factory" class="w-4 h-4" />
        {{ factory.name }}
      </NuxtLink>
    </div>
  </div>
</template>
