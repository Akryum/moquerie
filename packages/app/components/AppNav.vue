<script lang="ts" setup>
const hasGraphQL = await useHasGraphql()

const commandPaletteStore = useCommandPaletteStore()

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
  <nav class="flex flex-col items-center p-0.5 border-r border-gray-300 dark:border-gray-700">
    <AppNavItem
      to="/"
      active-route="/"
      icon="i-ph-house"
      title="Home"
    />

    <AppNavItem
      icon="i-ph-magnifying-glass"
      title="Search & commands"
      shortcuts="meta_k"
      @click="commandPaletteStore.isOpen = true"
    />

    <div class="w-full">
      <div class="h-px bg-gray-300 dark:bg-gray-700 mx-3 my-1" />
    </div>

    <AppNavItem
      to="/db/resources"
      icon="i-ph-database"
      title="Resources"
      shortcuts="meta_shift_r"
    />

    <AppNavItem
      to="/db/factories"
      icon="i-ph-factory"
      title="Factories"
      shortcuts="meta_shift_f"
    />

    <AppNavItem
      to="/db/snapshots"
      icon="i-ph-camera"
      title="Snapshots"
      shortcuts="meta_shift_s"
    />

    <AppNavItem
      to="/db/history"
      icon="i-ph-clock-clockwise"
      title="History"
      shortcuts="meta_shift_h"
    />

    <div class="w-full">
      <div class="h-px bg-gray-300 dark:bg-gray-700 mx-3 my-1" />
    </div>

    <AppNavItem
      v-if="hasGraphQL"
      to="/graphql/schema"
      active-route="/graphql"
      icon="i-mdi-graphql"
      title="GraphQL"
    />

    <div class="flex-1 w-0" />

    <div class="w-full">
      <div class="h-px bg-gray-300 dark:bg-gray-700 mx-3 my-1" />
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
      shortcuts="meta_,"
    />
  </nav>
</template>