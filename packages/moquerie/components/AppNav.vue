<script lang="ts" setup>
const hasGraphQL = await useHasGraphql()

const commandPaletteStore = useCommandPaletteStore()
const { metaSymbol } = useShortcuts()

const router = useRouter()

defineShortcuts({
  'meta_,': {
    usingInput: true,
    handler: () => {
      router.push('/config/inspect')
    },
  },
  'meta_shift_r': {
    usingInput: true,
    handler: () => {
      router.push('/db/resources')
    },
  },
  'meta_shift_f': {
    usingInput: true,
    handler: () => {
      router.push('/db/factories')
    },
  },
  'meta_shift_s': {
    usingInput: true,
    handler: () => {
      router.push('/db/snapshots')
    },
  },
  'meta_shift_h': {
    usingInput: true,
    handler: () => {
      router.push('/db/history')
    },
  },
})

const colorMode = useColorMode()
</script>

<template>
  <nav class="flex flex-col items-center p-0.5">
    <AppNavItem
      to="/"
      active-route="/"
      icon="i-ph-house"
      title="Home"
    />

    <AppNavItem
      icon="i-ph-magnifying-glass"
      title="Search & commands"
      :shortcuts="[metaSymbol, 'K']"
      @click="commandPaletteStore.isOpen = true"
    />

    <div class="w-full">
      <div class="h-px bg-gray-300 dark:bg-gray-600 mx-2 my-1" />
    </div>

    <AppNavItem
      to="/db/resources"
      active-route="/db"
      icon="i-ph-database"
      title="Database"
    />

    <AppNavItem
      v-if="hasGraphQL"
      to="/graphql/schema"
      active-route="/graphql"
      icon="i-mdi-graphql"
      title="GraphQL"
    />

    <div class="flex-1 w-0" />

    <div class="w-full">
      <div class="h-px bg-gray-300 dark:bg-gray-600 mx-2 my-1" />
    </div>

    <!-- Theme toggle -->
    <AppNavItem
      :icon="colorMode.preference === 'dark' ? 'i-ph-moon' : colorMode.preference === 'system' ? 'i-ph-circle-half-tilt' : 'i-ph-sun'"
      :title="colorMode.preference === 'dark' ? 'Switch to System theme' : colorMode.preference === 'system' ? 'Switch to Light theme' : 'Switch to Dark theme'"
      @click="colorMode.preference = colorMode.preference === 'dark' ? 'system' : colorMode.preference === 'system' ? 'light' : 'dark'"
    />

    <AppNavItem
      to="/config/inspect"
      active-route="/config"
      icon="i-ph-sliders"
      title="Config"
      :shortcuts="[metaSymbol, ',']"
    />
  </nav>
</template>
