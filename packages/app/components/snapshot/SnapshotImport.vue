<script lang="ts" setup>
import type { DatabaseSnapshot } from '@moquerie/core'

const props = defineProps<{
  snapshot: DatabaseSnapshot
}>()

const emit = defineEmits<{
  cancel: []
  branchCreate: [branchName: string]
  overwrite: []
}>()

const toast = useToast()

// Mode

type Mode = 'create-branch' | 'overwrite'

const mode = useLocalStorage<Mode>('snapshot-import-mode', 'create-branch')

// Create branch

const branchName = ref(`snapshot-${props.snapshot.id}`)
const branchNameInput = ref<any>()

function focusBranchNameInput() {
  setTimeout(() => {
    branchNameInput.value?.input?.focus()
    branchNameInput.value?.input?.select()
  }, 300)
}

watch(mode, (value) => {
  if (value === 'create-branch') {
    focusBranchNameInput()
  }
}, {
  immediate: true,
})

async function createBranch() {
  try {
    await $fetch(`/api/snapshots/${props.snapshot.id}/createBranch`, {
      method: 'POST',
      body: {
        branchName: branchName.value,
      },
    })

    emit('branchCreate', branchName.value)

    toast.add({
      id: 'snapshot-branch-created',
      title: `Branch ${branchName.value} created from snapshot`,
      icon: 'i-ph-check-circle',
      color: 'green',
    })

    refreshNuxtData('currentBranch')
  }
  catch (e: any) {
    toast.add({
      id: 'snapshot-error',
      title: 'Error',
      description: e.data?.message ?? e.message,
      icon: 'i-ph-x-circle',
      color: 'red',
    })
  }
}

// Overwrite

async function overwrite() {
  try {
    await $fetch(`/api/snapshots/${props.snapshot.id}/overwriteBranch`, {
      method: 'POST',
    })

    emit('overwrite')

    toast.add({
      id: 'snapshot-overwritten',
      title: 'Changes applied to current branch',
      icon: 'i-ph-check-circle',
      color: 'green',
    })
  }
  catch (e: any) {
    toast.add({
      id: 'snapshot-error',
      title: 'Error',
      description: e.data?.message ?? e.message,
      icon: 'i-ph-x-circle',
      color: 'red',
    })
  }
}

// Cancel

defineShortcuts({
  escape: {
    usingInput: true,
    handler: () => {
      emit('cancel')
    },
  },
})
</script>

<template>
  <div class="space-y-4">
    <div class="text-gray-500 flex items-center gap-1">
      <UIcon name="i-ph-arrow-u-up-right" />
      Import snapshot to Database
    </div>

    <div class="space-y-2">
      <URadioGroup
        v-model="mode"
        :options="[{
          label: 'Create a new branch from snapshot',
          value: 'create-branch',
        }]"
      />

      <UFormGroup
        label="Branch name"
        :class="{
          'opacity-50': mode !== 'create-branch',
        }"
      >
        <UInput
          ref="branchNameInput"
          v-model="branchName"
          :disabled="mode !== 'create-branch'"
        />
      </UFormGroup>
    </div>

    <div class="space-y-2">
      <URadioGroup
        v-model="mode"
        :options="[{
          label: 'Overwrite current branch with snapshot',
          value: 'overwrite',
        }]"
      />

      <div v-if="mode === 'overwrite'" class="text-sm flex items-center gap-2 p-2 rounded text-orange-500 border border-current">
        <UIcon name="i-ph-warning" class="w-6 h-6 flex-none" />
        Existing instances with the same ids will be permanently overwritten.
      </div>
    </div>

    <FormActions class="!py-0">
      <UButton
        color="gray"
        @click="$emit('cancel')"
      >
        Cancel
        <KbShortcut keys="escape" />
      </UButton>

      <UButton
        v-if="mode === 'create-branch'"
        icon="i-ph-arrows-split"
        :disabled="!branchName"
        @click="createBranch()"
      >
        Create branch
        <KbShortcut keys="meta_enter" />
      </UButton>

      <UButton
        v-if="mode === 'overwrite'"
        icon="i-ph-arrows-merge"
        color="orange"
        @click="overwrite()"
      >
        Overwrite current branch
        <KbShortcut keys="meta_enter" />
      </UButton>
    </FormActions>
  </div>
</template>
