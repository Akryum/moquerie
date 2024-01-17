<script lang="ts" setup>
import type { DatabaseSnapshot } from '@moquerie/core'

useHead({
  title: 'Create snapshot',
})

const router = useRouter()

function onCreated(snapshot: DatabaseSnapshot) {
  router.push({
    name: 'db-snapshots-snapshotId',
    params: {
      snapshotId: snapshot.id,
    },
    query: {
      snapshotLocation: snapshot.location,
    },
  })
}
</script>

<template>
  <div class="space-y-4 p-4 max-w-[600px]">
    <h1>Create snapshot</h1>

    <SnapshotForm
      @complete="onCreated"
    />
  </div>
</template>
