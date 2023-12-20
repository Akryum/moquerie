<script lang="ts" setup>
const { data, refresh } = await useFetch('/api/server')
onWindowFocus(refresh)

const { copy } = useClipboard()
</script>

<template>
  <div v-if="data" class="flex flex-col gap-2">
    <div class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
      <UIcon name="i-ph-activity" class="w-6 h-6 text-green-500" />

      <div>
        Server listening on port
        <span class="font-mono text-green-500 font-bold">{{ data.port }}</span>
      </div>
    </div>

    <div
      v-for="(item, index) in data.routeInfos"
      :key="index"
      class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800"
    >
      <UIcon :name="item.icon ?? 'i-ph-globe-simple'" class="w-6 h-6 text-gray-500" />

      <div>
        <div>{{ item.label }}</div>
        <div class="font-mono text-gray-500">
          {{ item.url }}
        </div>
      </div>

      <div class="flex">
        <UButton
          color="gray"
          variant="link"
          icon="i-ph-clipboard"
          @click="copy(item.url)"
        />

        <UButton
          :to="item.url"
          target="_blank"
          color="gray"
          variant="link"
          icon="i-ph-arrow-square-out"
        />
      </div>
    </div>
  </div>
</template>
