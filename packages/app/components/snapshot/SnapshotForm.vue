<script lang="ts" setup>
import type { DatabaseSnapshot, DBLocation } from '@moquerie/core'
import { Dropdown } from 'floating-vue'
import SuperJSON from 'superjson'

const props = defineProps<{
  snapshot?: DatabaseSnapshot
}>()

const emit = defineEmits<{
  cancel: []
  complete: [snapshot: DatabaseSnapshot]
}>()

interface FormData {
  id: string
  location: DBLocation
  description: string
  tags: string[]
}

function getInitialValues(snapshot = props.snapshot): FormData {
  return {
    id: snapshot?.id ?? '',
    location: snapshot?.location ?? getDbLocationFromRouteQuery('snapshotLocation') ?? 'local',
    description: snapshot?.description ?? '',
    tags: snapshot?.tags ? structuredClone(toRaw(snapshot.tags)) : [],
  }
}

const state = ref<FormData>(getInitialValues())

const stateChanged = ref(false)

watch(() => props.snapshot, () => {
  if (!stateChanged.value) {
    state.value = getInitialValues()
    nextTick(() => {
      stateChanged.value = false
    })
  }
})

watch(state, () => {
  stateChanged.value = true
}, { deep: true })

const tags = useTagModel(state.value, 'tags')

// Resources selection

const resources = ref<Record<string, string[]>>({})
const resourcesSelectShown = ref(false)

if (!props.snapshot) {
  resources.value = await $fetch('/api/resources/ids')
}

const totalCount = computed(() => countItemsInRecordOfArrays(resources.value))

// Submit

function validate(state: FormData) {
  const errors = []

  if (!state.id) {
    errors.push({ path: 'id', message: 'Identifier is required' })
  }

  if (!totalCount.value && !props.snapshot) {
    errors.push({ path: 'resources', message: 'At least one resource must be selected' })
  }

  return errors
}

const snapshotStore = useSnapshotStore()

const toast = useToast()

async function onSubmit() {
  const errors = validate(state.value)
  if (errors.length) {
    return
  }

  try {
    let snapshot: DatabaseSnapshot

    if (props.snapshot) {
      snapshot = SuperJSON.parse(await $fetch(`/api/snapshots/${props.snapshot.id}`, {
        method: 'PATCH',
        body: {
          ...state.value,
        },
      }))

      toast.add({
        id: 'snapshot-updated',
        title: 'Snapshot details updated!',
        icon: 'i-ph-check-circle',
        color: 'green',
      })
    }
    else {
      snapshot = SuperJSON.parse(await $fetch('/api/snapshots', {
        method: 'POST',
        body: {
          ...state.value,
          resources: resources.value,
        },
      }))

      toast.add({
        id: 'snapshot-created',
        title: 'Snapshot created!',
        icon: 'i-ph-check-circle',
        color: 'green',
      })
    }

    emit('complete', snapshot)

    snapshotStore.refreshSnapshots()

    state.value = getInitialValues(snapshot)
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

// Shortcuts

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      onSubmit()
    },
    whenever: [() => !resourcesSelectShown.value],
  },
})

// Cancel

async function onCancel() {
  emit('cancel')

  if (props.snapshot) {
    state.value = getInitialValues()
    await nextTick()
    stateChanged.value = false
  }
}
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="flex flex-col gap-4"
    @submit="onSubmit()"
  >
    <UFormGroup name="id" label="Identifier" required>
      <UInput
        v-model="state.id"
        autofocus
        placeholder="Examples: NewUserWithMessages, getNewUser, createEmptyItem"
      />
    </UFormGroup>

    <FormGroupLocationInput v-model="state.location" />

    <UFormGroup name="description" label="Description" hint="What is the scenario in which this snapshot is useful?">
      <UTextarea v-model="state.description" autoresize :rows="1" />
    </UFormGroup>

    <UFormGroup name="tags" label="Tags" hint="Separate tags with commas">
      <UInput v-model="tags" placeholder="tag1, tag2, tag3" />
    </UFormGroup>

    <UFormGroup v-if="!snapshot" name="resources" label="Resources" required>
      <UButton
        color="gray"
        icon="i-ph-database"
        trailing-icon="i-ph-plus"
        block
        @click="resourcesSelectShown = true"
      >
        <div class="w-full text-left">
          {{ totalCount ? `${totalCount} resource${totalCount <= 1 ? '' : 's'} selected` : 'Select resources' }}
        </div>
      </UButton>
    </UFormGroup>

    <FormActions class="-bottom-4">
      <UButton
        color="gray"
        @click="onCancel()"
      >
        Cancel
      </UButton>

      <UButton
        type="submit"
        icon="i-ph-check"
        :disabled="snapshot && !stateChanged"
      >
        {{ snapshot ? 'Update snapshot' : 'Create snapshot' }}

        <KbShortcut :keys="['meta', 'enter']" />
      </UButton>

      <div class="flex-1" />

      <Dropdown>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-ph-code"
        />

        <template #popper>
          <div class="p-6 overflow-auto max-w-[400px] max-h-[400px] text-xs">
            <pre>{{ { state, resources } }}</pre>
          </div>
        </template>
      </Dropdown>
    </FormActions>

    <UModal
      v-model="resourcesSelectShown"
      :ui="{
        width: 'sm:w-[calc(100vw-200px)] sm:max-w-[1200px]',
        height: 'sm:h-[calc(100vh-200px)] sm:max-h-[900px]',
      }"
    >
      <ResourceSelectMultiple
        :resources="resources"
        class="h-full"
        @cancel="resourcesSelectShown = false"
        @select="resourcesSelectShown = false;resources = $event"
      />
    </UModal>
  </UForm>
</template>
