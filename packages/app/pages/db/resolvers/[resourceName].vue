<script lang="ts" setup>
const route = useRoute()
</script>

<template>
  <ResolverList
    :resource-name="String(route.params.resourceName)"
  />
</template>
