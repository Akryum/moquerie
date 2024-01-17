<script lang="ts" setup>
import { Tooltip } from 'floating-vue'

useHead({
  title: 'Snapshot',
})

const route = useRoute()
const router = useRouter()
const snapshotStore = useSnapshotStore()

const snapshot = await snapshotStore.fetchSnapshot(String(route.params.snapshotId))

// Delete

const showConfirmRemove = ref(false)

async function deleteSnapshot() {
  if (!snapshot.value) {
    return
  }
  await snapshotStore.deleteSnapshot(snapshot.value.id)
  showConfirmRemove.value = false
  router.push({
    name: 'db-snapshots',
    query: {
      ...route.query,
    },
  })
}

defineShortcuts({
  meta_delete: {
    usingInput: true,
    handler: () => {
      showConfirmRemove.value = true
    },
  },
})

// Edit

const showEdit = ref(false)

defineShortcuts({
  F2: {
    usingInput: true,
    handler: () => {
      showEdit.value = true
    },
  },
})

function onEditComplete() {
  showEdit.value = false
  snapshotStore.refreshSnapshot()
}
</script>

<template>
  <div v-if="snapshot" class="flex flex-col">
    <div class="flex p-2 border-b border-gray-200 dark:border-gray-800">
      <SnapshotInfoLine
        :snapshot="snapshot"
      />

      <div class="flex-1 flex items-center justify-end gap-2">
        <Tooltip>
          <UButton
            icon="i-ph-pencil"
            color="gray"
            variant="ghost"
            @click="showEdit = true"
          />

          <template #popper>
            <div>Edit snapshot details</div>
            <KbShortcut keys="F2" />
          </template>
        </Tooltip>

        <Tooltip>
          <UButton
            icon="i-ph-trash"
            color="red"
            variant="ghost"
            @click="showConfirmRemove = true"
          />

          <template #popper>
            <div>Delete snapshot</div>
            <KbShortcut keys="meta_delete" />
          </template>
        </Tooltip>
      </div>
    </div>

    <SnapshotResources
      :snapshot="snapshot"
      class="flex-1 h-0"
    />

    <ConfirmModal
      :shown="showConfirmRemove"
      title="Delete snapshot?"
      icon="i-ph-camera"
      confirm-label="Delete snapshot"
      confirm-icon="i-ph-trash"
      @cancel="showConfirmRemove = false"
      @confirm="deleteSnapshot()"
    >
      <template #after-title>
        <span class="border border-gray-500/50 rounded-lg px-1.5 font-bold text-primary">{{ snapshot.id }}</span>
      </template>
    </ConfirmModal>

    <UModal
      v-model="showEdit"
    >
      <SnapshotForm
        :snapshot="snapshot"
        class="p-4"
        @cancel="showEdit = false"
        @complete="onEditComplete"
      />
    </UModal>
  </div>
</template>
