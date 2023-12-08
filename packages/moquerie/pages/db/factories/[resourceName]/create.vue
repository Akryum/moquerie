<script lang="ts" setup>
import type { ResourceFactory } from '~/types/factory.js'

const router = useRouter()
const route = useRoute()

function onComplete(factory: ResourceFactory) {
  router.push({
    name: 'db-factories-resourceName-view-factoryId',
    params: {
      resourceName: route.params.resourceName as string,
      factoryId: factory.id,
    },
  })
}
</script>

<template>
  <FactoryForm
    :resource-name="$route.params.resourceName as string"
    @complete="onComplete"
    @cancel="$router.push({ name: 'db-factories-resourceName' })"
  />
</template>
