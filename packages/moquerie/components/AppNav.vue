<script lang="ts" setup>
const hasGraphQL = await useFetch('/api/graphql/hasGraphql')
onWindowFocus(hasGraphQL.refresh)
onConfigChange(hasGraphQL.refresh)
</script>

<template>
  <nav class="flex flex-col items-center p-0.5">
    <AppNavItem
      to="/"
      icon="i-ph-house"
      title="Home"
    />

    <AppNavItem
      v-if="hasGraphQL.data.value"
      to="/graphql/schema"
      icon="i-mdi-graphql"
      title="GraphQL"
    />

    <div class="flex-1 w-0" />

    <AppNavItem
      to="/config/inspect"
      icon="i-ph-sliders"
      title="Config"
    />
  </nav>
</template>
