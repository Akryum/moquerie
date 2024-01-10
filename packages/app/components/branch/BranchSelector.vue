<script lang="ts" setup>
import { Dropdown, Tooltip } from 'floating-vue'
import { isBranchesOpen } from './branchOverlays.js'

const { data: currentBranch, refresh: refreshCurrentBranch } = useFetch('/api/branches/current')
onWindowFocus(refreshCurrentBranch)

const { data: branches, refresh: refreshBranches } = useFetch('/api/branches')
onWindowFocus(refreshBranches)

const shown = isBranchesOpen

defineShortcuts({
  meta_b: {
    usingInput: true,
    handler: () => {
      shown.value = !shown.value
    },
  },
})

const resourceInstanceStore = useResourceInstanceStore()

async function switchToBranch(branch: string) {
  shown.value = false
  await $fetch('/api/branches/current', {
    method: 'POST',
    body: {
      branch,
    },
  })
  refreshCurrentBranch()
  resourceInstanceStore.refreshInstances()
  resourceInstanceStore.refreshInstance()
}

const createShown = ref(false)
const createName = ref('')

async function createBranch(branch?: string) {
  createName.value = branch ?? ''
  createShown.value = true
  setTimeout(() => {
    shown.value = false
  }, 100)
}

const linkList = ref()

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      createBranch(linkList.value?.filter)
    },
    whenever: [shown],
  },
})

async function onCreateBranch(branch: string) {
  createShown.value = false
  await switchToBranch(branch)
  await refreshBranches()
}
</script>

<template>
  <div>
    <Dropdown
      v-model:shown="shown"
      placement="bottom"
      auto-size="min"
    >
      <Tooltip
        :disabled="shown"
      >
        <UButton
          icon="i-ph-git-branch"
          trailing-icon="i-ph-caret-down"
          variant="outline"
          block
        >
          <div class="w-full text-left">
            {{ currentBranch }}
          </div>
        </UButton>

        <template #popper>
          <div>Current branch</div>
          <div class="text-gray-500 text-sm">
            Branches are used to create different versions of your database.
          </div>
          <KbShortcut keys="meta_b" class="mt-2" />
        </template>
      </Tooltip>

      <template #popper>
        <div class="p-2 md:min-w-[400px]">
          <LinkList
            ref="linkList"
            :items="branches ?? []"
            :selected-item="item => item === currentBranch"
            :filter="(item, filterValue) => new RegExp(filterValue, 'i').test(item)"
            filter-placeholder="Filter or create branch..."
            @select="switchToBranch"
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
                {{ item }}
              </LinkListItem>
            </template>
          </LinkList>
        </div>
      </template>
    </Dropdown>

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
  </div>
</template>
