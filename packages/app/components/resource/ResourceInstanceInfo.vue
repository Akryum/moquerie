<script lang="ts" setup>
import { vTooltip } from 'floating-vue'
import type { ResourceInstance } from '@moquerie/core'

const props = defineProps<{
  instance: ResourceInstance
}>()

const factoryStore = useFactoryStore()
const factory = props.instance.factoryId ? await factoryStore.fetchFactory(props.instance.factoryId) : null

// Copy ref

const toast = useToast()
const { copy } = useClipboard()
function copyRef() {
  copy(`{
  "__resourceName": "${props.instance.resourceName}",
  "__id": "${props.instance.id}"
}`)

  toast.add({
    title: 'Reference copied',
    icon: 'i-ph-clipboard',
  })
}
</script>

<template>
  <div>
    <div class="text-sm [&>*]:p-1 leading-none">
      <div class="flex items-center gap-1">
        <UIcon name="i-ph-database" class="w-4 h-4 flex-none" />
        <span>{{ instance.resourceName }}</span>
        <span class="text-primary-500 break-all truncate">{{ instance.id }}</span>
        <UButton
          variant="link"
          :padded="false"
          icon="i-ph-clipboard"
          @click="copyRef()"
        >
          Copy ref
        </UButton>
      </div>
      <div class="text-xs leading-none">
        <div class="flex items-center gap-1 truncate">
          <UIcon name="i-ph-calendar-blank" class="w-4 h-4 flex-none" />
          Created {{ instance.createdAt.toLocaleString() }}
        </div>
        <div class="!pl-5 truncate">
          Updated {{ instance.updatedAt?.toLocaleString() ?? '-' }}
        </div>
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
