<script lang="ts" setup>
import { useRouteQuery } from '@vueuse/router'
import type { DBLocation, DatabaseSnapshot, ResourceFactory } from '@moquerie/core'
import LinkList from '../LinkList.vue'

const route = useRoute()

// Location

const location = useRouteQuery<DBLocation>('snapshotLocation', 'local')

const linkList = ref<InstanceType<typeof LinkList> | null>(null)

function onClickOnLocationButton() {
  linkList.value?.focusFilterInput()
}

// Snapshots

const snapshotStore = useSnapshotStore()

watchEffect(() => {
  snapshotStore.fetchSnapshots({
    location: location.value,
  })
})

// Filter

function filter(item: DatabaseSnapshot, filterValue: string): boolean {
  return item.id.toLowerCase().includes(filterValue)
    || item.tags.some(tag => tag.toLowerCase().includes(filterValue))
    || item.description?.toLowerCase().includes(filterValue)
    || item.author.name.toLowerCase().includes(filterValue)
    || item.author.email?.toLowerCase().includes(filterValue)
    || false
}

// Open

const router = useRouter()

function onOpen(snapshot: DatabaseSnapshot) {
  router.push({
    name: 'db-snapshots-snapshotId',
    params: {
      ...route.params,
      snapshotId: snapshot.id,
    },
    query: {
      ...route.query,
    },
  })
}
</script>

<template>
  <LinkList
    id="snapshot-list"
    ref="linkList"
    :items="snapshotStore.snapshots"
    :filter="filter"
    :selected-item="(item, route) => item.id === route.params.snapshotId"
    filter-placeholder="Filter snapshots by name, tags..."
    class="p-2"
    @select="onOpen"
  >
    <template #toolbar>
      <UButton
        :to="{
          name: 'db-snapshots-create',
          query: {
            ...$route.query,
          },
        }"
        icon="i-ph-plus"
        block
        :disabled="$route.name === 'db-snapshots-create'"
      >
        Create snapshot
      </UButton>

      <RadioButtonGroup
        v-model="location"
        :button-attrs="{
          color: 'gray',
          size: 'xs',
          block: true,
        }"
        :options="[
          {
            value: 'local',
            label: 'Local',
            count: snapshotStore.counts.local,
          },
          {
            value: 'repository',
            label: 'Repository',
            count: snapshotStore.counts.repository,
          },
        ]"
        @update:model-value="onClickOnLocationButton()"
      />
    </template>

    <template #default="{ item, ...props }">
      <SnapshotListItem
        :snapshot="item"
        v-bind="props"
      />
    </template>
  </LinkList>
</template>
