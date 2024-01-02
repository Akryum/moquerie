<script lang="ts" setup>
const { data, refresh } = useFetch('/api/user/current')
onWindowFocus(refresh)
</script>

<template>
  <UserAvatar
    v-if="data"
    :user="data"
  />
</template>
