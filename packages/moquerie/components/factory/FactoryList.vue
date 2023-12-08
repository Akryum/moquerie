<script lang="ts" setup>
import SuperJSON from 'superjson'
import { useRouteQuery } from '@vueuse/router'
import type { DBLocation } from '~/types/db.js'
import type { ResourceFactory } from '~/types/factory.js'

const location = useRouteQuery<DBLocation>('factoryLocation', 'local')
const route = useRoute()

const resourceName = computed(() => route.params.resourceName)

const { data: factories, refresh } = await useFetch('/api/factories', {
  query: {
    resourceName,
    location,
  },
  transform: value => SuperJSON.parse<ResourceFactory[]>(value as any),
})
onWindowFocus(refresh)

// Filter

const filter = ref('')

const filteredFactories = computed(() => {
  const list = factories.value ?? []
  if (!filter.value) {
    return list
  }
  const reg = new RegExp(filter.value, 'i')
  return list.filter((factory) => {
    return reg.test(factory.name) || reg.test(factory.tags.join(' '))
  })
})
</script>

<template>
  <div class="flex flex-col">
    <div class="p-1.5 flex flex-col gap-1">
      <RadioButtonGroup
        v-model="location"
        :button-attrs="{
          color: 'gray',
          size: 'xs',
          block: true,
        }"
        :options="[
          {
            value: 'local',
            label: 'Local',
          },
          {
            value: 'repository',
            label: 'Repository',
          },
        ]"
      />

      <UInput
        v-model="filter"
        size="xs"
        placeholder="Filter factories by name, tag..."
        icon="i-ph-magnifying-glass"
        class="w-full"
        autocomplete="off"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #trailing>
          <UButton
            v-show="filter"
            icon="i-ph-backspace"
            color="gray"
            variant="link"
            size="xs"
            :padded="false"
            @click="filter = ''"
          />
        </template>
      </UInput>
    </div>

    <div class="flex-1 overflow-y-auto">
      <FactoryListItem
        v-for="factory in filteredFactories"
        :key="factory.id"
        :factory="factory"
      />
    </div>
  </div>
</template>
