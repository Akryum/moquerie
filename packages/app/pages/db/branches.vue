<script lang="ts" setup>
useSaveRoute({
  key: 'db.branches.lastRoute',
  basePath: '/db/branches',
  defaultRoute: {
    name: 'db-branches',
  },
})

useHead({
  title: 'Branches',
})

const { data: currentBranch, refresh: refreshCurrentBranch } = useFetch('/api/branches/current', {
  key: 'currentBranch',
})
onWindowFocus(refreshCurrentBranch)

const { data: branches, refresh: refreshBranches } = useFetch('/api/branches', {
  key: 'branches',
})
onWindowFocus(refreshBranches)

const resourceInstanceStore = useResourceInstanceStore()

async function switchToBranch(branch: string) {
  await $fetch('/api/branches/current', {
    method: 'POST',
    body: {
      branch,
    },
  })
  await refreshNuxtData('currentBranch')
  resourceInstanceStore.refreshInstances()
  resourceInstanceStore.refreshInstance()
}

const filterFocused = ref(false)

// Create

const createShown = ref(false)
const createName = ref('')

async function createBranch(branch?: string) {
  createName.value = branch ?? ''
  createShown.value = true
}

const linkList = ref()

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      createBranch(linkList.value?.filter)
    },
    whenever: [filterFocused],
  },
})

async function onCreateBranch(branch: string) {
  createShown.value = false
  await switchToBranch(branch)
  await refreshNuxtData('branches')
}

// Delete

const deleteShown = ref(false)
const deleteBranchName = ref('')

async function deleteBranch(branch: string) {
  if (branch === currentBranch.value || branch === 'default') {
    return
  }

  deleteBranchName.value = branch
  deleteShown.value = true
}

async function confirmDeleteBranch() {
  deleteShown.value = false
  await $fetch('/api/branches', {
    method: 'DELETE',
    body: {
      branch: deleteBranchName.value,
    },
  })
  await refreshNuxtData('branches')
}

// Rename branch

const renameShown = ref(false)
const renameBranchName = ref('')
const renameBranchNewName = ref('')

async function renameBranch(branch: string) {
  if (branch === currentBranch.value || branch === 'default') {
    return
  }

  renameBranchName.value = branch
  renameBranchNewName.value = branch
  renameShown.value = true
}

async function confirmRenameBranch() {
  renameShown.value = false
  await $fetch('/api/branches/rename', {
    method: 'POST',
    body: {
      branch: renameBranchName.value,
      newName: renameBranchNewName.value,
    },
  })
  await refreshNuxtData('branches')
}

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      confirmRenameBranch()
    },
    whenever: [renameShown],
  },
  escape: {
    usingInput: true,
    handler: () => {
      renameShown.value = false
    },
    whenever: [renameShown],
  },
})
</script>

<template>
  <div>
    <div class="p-6 lg:max-w-[800px] mx-auto h-full flex flex-col space-y-6">
      <div class="flex items-center gap-2">
        <UIcon name="i-ph-git-branch" class="w-6 h-6" />
        Branches are different versions of your database, useful to test different use cases.
      </div>

      <LinkList
        ref="linkList"
        :items="branches ?? []"
        :selected-item="item => item === currentBranch"
        :filter="(item, filterValue) => new RegExp(filterValue, 'i').test(item)"
        filter-placeholder="Filter or create branch..."
        class="flex-1"
        @select="switchToBranch"
        @focus-filter="filterFocused = $event"
      >
        <template #before-items="{ filter }">
          <UButton
            color="gray"
            class="my-0.5"
            @click="createBranch(filter)"
          >
            <div class="text-left w-full flex items-center gap-1">
              Create branch {{ filter ? `"${filter}"` : '' }}

              <UIcon name="i-ph-arrows-split" class="w-4 h-4 flex-none" />
            </div>

            <KbShortcut keys="meta_enter" />
          </UButton>
        </template>

        <template #default="{ item, ...props }">
          <LinkListItem
            v-bind="props"
            :ui="{
              button: {
                class: 'text-sm text-left',
              },
            }"
            @click="switchToBranch(item)"
          >
            <div class="flex items-center min-h-8 pl-2 gap-2">
              <div class="flex-1">
                {{ item }}
              </div>

              <div v-if="item === currentBranch" class="pr-2 opacity-50">
                Current
              </div>
              <template v-else-if="item !== 'default'">
                <UButton
                  icon="i-ph-note-pencil"
                  color="gray"
                  size="sm"
                  @click.stop="renameBranch(item)"
                >
                  Rename
                </UButton>
                <UButton
                  icon="i-ph-trash"
                  color="gray"
                  size="sm"
                  @click.stop="deleteBranch(item)"
                >
                  Delete
                </UButton>
              </template>
            </div>
          </LinkListItem>
        </template>
      </LinkList>
    </div>

    <UModal
      v-model="createShown"
    >
      <UCard>
        <template #header>
          <h2 class="text-lg font-bold flex items-center gap-2">
            <UIcon name="i-ph-git-branch" class="w-6 h-6" />
            Create a new branch
          </h2>
        </template>

        <BranchCreateForm
          :name="createName"
          @cancel="createShown = false"
          @create="onCreateBranch"
        />

        <template #footer>
          <div class="text-gray-500">
            Branches are used to create different versions of your database.
          </div>
        </template>
      </UCard>
    </UModal>

    <ConfirmModal
      :shown="deleteShown"
      :title="`Delete branch ${deleteBranchName}`"
      icon="i-ph-trash"
      @confirm="confirmDeleteBranch()"
      @cancel="deleteShown = false"
    />

    <UModal
      v-model="renameShown"
    >
      <UCard>
        <template #header>
          <h2 class="text-lg font-bold flex items-center gap-2">
            <UIcon name="i-ph-note-pencil" class="w-6 h-6" />
            Rename branch {{ renameBranchName }}
          </h2>
        </template>

        <UFormGroup label="Branch name">
          <UInput v-model="renameBranchNewName" autofocus />
        </UFormGroup>

        <template #footer>
          <div class="flex items-center gap-2">
            <UButton
              color="gray"
              @click="renameShown = false"
            >
              Cancel

              <KbShortcut :keys="['escape']" />
            </UButton>

            <UButton
              color="red"
              @click="confirmRenameBranch()"
            >
              Rename

              <KbShortcut :keys="['meta', 'enter']" />
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
