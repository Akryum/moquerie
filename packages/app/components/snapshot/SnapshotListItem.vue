<script lang="ts" setup>
import type { DatabaseSnapshot } from '@moquerie/core'

const props = defineProps<{
  snapshot: DatabaseSnapshot
}>()

const ago = useTimeAgo(() => props.snapshot.date)
</script>

<template>
  <LinkListItem
    :to="{
      name: 'db-snapshots-snapshotId',
      params: {
        ...$route.params,
        snapshotId: snapshot.id,
      },
      query: {
        ...$route.query,
      },
    }"
  >
    <div class="h-[40px] flex flex-col items-stretch justify-center">
      <div class="text-sm leading-tight truncate">
        {{ snapshot.id }}
      </div>
      <div class="text-xs opacity-50 leading-tight truncate">
        {{ snapshot.description || ago }}
      </div>
    </div>

    <template #tooltip>
      <div class="flex flex-col gap-1">
        <SnapshotInfo
          :snapshot="snapshot"
        />
      </div>
    </template>
  </LinkListItem>
</template>
