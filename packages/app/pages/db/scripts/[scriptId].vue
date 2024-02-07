<script lang="ts" setup>
const route = useRoute()
</script>

<template>
  <ScriptView :id="route.params.scriptId" />
</template>
