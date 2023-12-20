<script lang="ts" setup>
import SuperJSON from 'superjson'
import type { ResourceFactory } from '@moquerie/core'

const emit = defineEmits<{
  close: []
}>()

const { metaSymbol } = useShortcuts()
const route = useRoute()

// Routes

const hasGraphQL = await useHasGraphql()

const routes = computed(() => [
  {
    id: '_route.home',
    to: '/',
    icon: 'i-ph-house',
    label: 'Home',
  },
  {
    id: '_route.db.resources',
    to: '/db/resources',
    icon: 'i-ph-table',
    label: 'Database > Resources',
    shortcuts: [metaSymbol.value, '⇧', 'R'],
  },
  {
    id: '_route.db.factories',
    to: '/db/factories',
    icon: 'i-ph-factory',
    label: 'Database > Factories',
    shortcuts: [metaSymbol.value, '⇧', 'F'],
  },
  {
    id: '_route.db.snapshots',
    to: '/db/snapshots',
    icon: 'i-ph-camera',
    label: 'Database > Snapshots',
    shortcuts: [metaSymbol.value, '⇧', 'S'],
  },
  {
    id: '_route.db.history',
    to: '/db/history',
    icon: 'i-ph-clock-clockwise',
    label: 'Database > History',
    shortcuts: [metaSymbol.value, '⇧', 'H'],
  },
  ...hasGraphQL.value
    ? [
        {
          id: '_route.graphql',
          to: '/graphql/schema',
          icon: 'i-ph-tree-structure',
          label: 'GraphQL > Schema',
        },
        {
          id: '_route.graphql',
          to: '/graphql/playground',
          icon: 'i-ph-play',
          label: 'GraphQL > Playground',
        },
      ]
    : [],
  {
    id: '_route.config',
    to: '/config/inspect',
    icon: 'i-ph-sliders',
    label: 'Config',
    shortcuts: [metaSymbol.value, ','],
  },
  {
    id: '_route.debug',
    to: '/debug',
    icon: 'i-ph-bug',
    label: 'Debug',
  },
])

// Resource

const resourceTypeStore = useResourceTypeStore()

const createResourceCommand = computed(() => {
  const resourceName = route.params.resourceName ?? resourceTypeStore.lastSelectedResourceName
  return {
    id: '_route.db.resource.create',
    icon: 'i-ph-plus',
    label: 'Create resource instance',
    to: resourceName
      ? {
          name: 'db-resources-resourceName-create',
          params: {
            resourceName,
          },
        }
      : {
          name: 'db-resources-create',
        },
  }
})

const resourceInstancesViewCommands = computed(() => resourceTypeStore.resourceTypes.map(resourceType => ({
  id: `_route.db.resource.${resourceType.name}.instances`,
  icon: 'i-ph-table',
  label: `View ${resourceType.name} instances`,
  to: {
    name: 'db-resources-resourceName-instances',
    params: {
      resourceName: resourceType.name,
    },
  },
})) ?? [])

// Factories

const createFactoryCommand = computed(() => {
  const resourceName = route.params.resourceName ?? resourceTypeStore.lastSelectedResourceName
  return {
    id: '_route.db.factories.create',
    icon: 'i-ph-plus',
    label: 'Create factory',
    to: resourceName
      ? {
          name: 'db-factories-resourceName-create',
          params: {
            resourceName,
          },
        }
      : {
          name: 'db-factories-create',
        },
  }
})

const { data: factories, refresh } = await useFetch('/api/factories', {
  transform: value => SuperJSON.parse<ResourceFactory[]>(value as any),
})
onWindowFocus(refresh)

const factoryCommands = computed(() => factories.value?.map(f => ({
  id: `factory.${f.name}`,
  icon: 'i-ph-factory',
  label: f.name,
  to: `/db/factories/${f.resourceName}/view/${f.id}`,
})) ?? [])

// Final command list

const groups = computed(() => [
  { key: 'routes', commands: routes.value, label: 'Views' },
  { key: 'resources', commands: [createResourceCommand.value, ...resourceInstancesViewCommands.value], label: 'Resources' },
  { key: 'factories', commands: [createFactoryCommand.value, ...factoryCommands.value], label: 'Factories' },
])

const router = useRouter()

function onSelect(command: any) {
  if (command.to) {
    router.push(command.to)
  }
  emit('close')
}

const commandPalette = ref<any>()

onMounted(() => {
  commandPalette.value?.$refs.comboboxInput.el.focus()
})
</script>

<template>
  <UCommandPalette
    ref="commandPalette"
    :close-button="{
      icon: 'i-ph-x',
      color: 'gray',
      variant: 'link',
      padded: false,
    }"
    :groups="groups"
    :fuse="{
      fuseOptions: {
        includeMatches: true,
      },
    }"
    @update:model-value="onSelect"
    @close="$emit('close')"
  />
</template>
