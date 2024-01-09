<script lang="ts" setup>
import type { ResourceFactory } from '@moquerie/core'

const route = useRoute()
const router = useRouter()

const factoryStore = useFactoryStore()
const factory = shallowRef(await factoryStore.fetchFactory(route.params.factoryId as string))

function onComplete(data: ResourceFactory) {
  factory.value = data
  router.push({
    name: 'db-factories-resourceName-view-factoryId',
    params: {
      resourceName: route.params.resourceName,
      factoryId: data.id,
    },
    query: {
      ...route.query,
      factoryLocation: data.location,
    },
  })
}
</script>

<template>
  <FactoryForm
    v-if="factory"
    :resource-name="$route.params.resourceName as string"
    :factory="factory"
    @complete="onComplete"
  >
    <template #before-form>
      <div>
        <UButton
          icon="i-ph-plus-circle"
          :to="{
            name: 'db-resources-resourceName-create',
            params: {
              resourceName: $route.params.resourceName,
            },
            query: {
              factory: factory.id,
            },
          }"
        >
          Generate instances with this factory
        </UButton>
      </div>
    </template>
  </FactoryForm>
</template>
