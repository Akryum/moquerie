<script lang="ts" setup>
const commandPaletteStore = useCommandPaletteStore()
const hasGraphQL = await useHasGraphql()

const { metaSymbol } = useShortcuts()

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

const groups = computed(() => [
  { key: 'routes', commands: routes.value, label: 'Views' },
])

const router = useRouter()

function onSelect(command: any) {
  if (command.to) {
    router.push(command.to)
  }
  commandPaletteStore.isOpen = false
}

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      commandPaletteStore.isOpen = !commandPaletteStore.isOpen
    },
  },
})
</script>

<template>
  <UModal
    v-model="commandPaletteStore.isOpen"
    :ui="{
      container: 'sm:items-start',
    }"
  >
    <UCommandPalette
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
      @close="commandPaletteStore.isOpen = false"
    />
  </UModal>
</template>
