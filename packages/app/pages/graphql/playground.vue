<script setup lang="ts">
const { data, refresh } = await useFetch('/api/server')
onWindowFocus(refresh)

const graphqlServer = computed(() => data.value?.routeInfos.find(item => item.type === 'graphql'))

useHead({
  title: 'Playground',
})
</script>

<template>
  <div v-if="!graphqlServer" class="flex">
    <UIcon name="i-ph-activity" class="w-8 h-8 m-auto text-gray-500" />
  </div>

  <div
    v-else
    class="flex"
  >
    <IframeKeepAlive
      id="graphql-playground"
      :src="graphqlServer.url"
      frameborder="0"
      class="flex-1 m-2 shadow-md"
      iframe-class="rounded-lg overflow-hidden"
    />
  </div>
</template>
