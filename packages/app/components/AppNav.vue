<script lang="ts" setup>
import { useHasRest } from '~/utils/rest.js'

const hasGraphQL = await useHasGraphql()
const hasRest = await useHasRest()

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
  'meta_shift_p': {
    usingInput: true,
    handler: () => {
      router.push('/pubsub')
    },
  },
  'meta_shift_e': {
    usingInput: true,
    handler: () => {
      router.push('/db/scripts')
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
  <nav class="flex flex-col items-center border-r border-gray-300 dark:border-gray-800">
    <AppNavItem
      to="/"
      active-route="/"
      icon="i-ph-house"
      title="Home"
    />

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
      to="/db/branches"
      icon="i-ph-git-branch"
      title="Branches"
    />

    <AppNavItem
      to="/pubsub"
      icon="i-ph-broadcast"
      title="PubSub (Realtime publications)"
      shortcuts="meta_shift_p"
    />

    <AppNavItem
      to="/db/scripts"
      icon="i-ph-code-block"
      title="Scripts"
      shortcuts="meta_shift_e"
    />

    <AppNavItem
      to="/db/resolvers"
      icon="i-ph-lightning"
      title="Resolvers"
    />

    <AppNavItem
      to="/db/history"
      icon="i-ph-clock-clockwise"
      title="History"
      shortcuts="meta_shift_h"
    />

    <AppNavItem
      v-if="hasRest"
      to="/rest"
      active-route="/rest"
      icon="i-carbon-api"
      title="RESTful"
    />

    <AppNavItem
      v-if="hasGraphQL"
      to="/graphql"
      active-route="/graphql"
      icon="i-mdi-graphql"
      title="GraphQL"
    />

    <div class="flex-1 w-0" />

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

    <UserCurrent
      class="my-2 flex-none"
    />
  </nav>
</template>
