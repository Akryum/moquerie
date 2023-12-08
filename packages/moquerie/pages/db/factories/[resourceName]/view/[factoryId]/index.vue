<script lang="ts" setup>
import SuperJSON from 'superjson'
import type { ResourceFactory } from '~/types/factory.js'

const route = useRoute()

const { data: factory } = await useFetch(`/api/factories/${route.params.factoryId}`, {
  transform: value => SuperJSON.parse<ResourceFactory>(value as any),
})
</script>

<template>
  <FactoryForm
    v-if="factory"
    :resource-name="$route.params.resourceName as string"
    :factory="factory"
    @complete="factory = $event"
  />
</template>
