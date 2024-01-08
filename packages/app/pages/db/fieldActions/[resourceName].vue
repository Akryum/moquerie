<script lang="ts" setup>
const route = useRoute()
</script>

<template>
  <FieldActionList
    :resource-name="String(route.params.resourceName)"
  />
</template>
