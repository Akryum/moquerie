<script lang="ts" setup>
const route = useRoute()
const factoryStore = useFactoryStore()
const factory = await factoryStore.fetchFactory(route.params.factoryId as string)
</script>

<template>
  <FactoryForm
    v-if="factory"
    :resource-name="$route.params.resourceName as string"
    :factory="factory"
    @complete="factory = $event"
  />
</template>
