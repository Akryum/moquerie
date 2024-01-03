<script lang="ts" setup>
const props = defineProps<{
  name?: string
}>()

const emit = defineEmits<{
  cancel: []
  create: [branch: string]
}>()

const state = ref({
  name: props.name ?? '',
  empty: false,
})

function validate(s: typeof state.value) {
  const errors = []
  if (!s.name) {
    errors.push({ path: 'name', message: 'Name is required' })
  }
  return errors
}

const error = ref()

async function createBranch() {
  if (!validate(state.value).length) {
    try {
      error.value = null
      await $fetch('/api/branches', {
        method: 'POST',
        body: {
          name: state.value.name,
          empty: state.value.empty,
        },
      })
      emit('create', state.value.name)
    }
    catch (e) {
      error.value = e
    }
  }
}

defineShortcuts({
  escape: {
    usingInput: true,
    handler: () => emit('cancel'),
  },
  enter: {
    usingInput: true,
    handler: () => createBranch(),
  },
})
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="space-y-4"
    @submit="createBranch"
  >
    <UFormGroup
      label="Name"
      name="name"
      required
    >
      <UInput
        v-model="state.name"
        placeholder="Name"
      />
    </UFormGroup>

    <UFormGroup
      name="empty"
    >
      <UCheckbox
        v-model="state.empty"
        label="Do not copy from current branch"
      />
    </UFormGroup>

    <FormActions>
      <UButton
        color="gray"
        @click="$emit('cancel')"
      >
        Cancel

        <KbShortcut keys="escape" />
      </UButton>

      <UButton
        color="red"
        icon="i-ph-git-branch"
        type="submit"
      >
        Create branch

        <KbShortcut keys="enter" />
      </UButton>
    </FormActions>

    <ErrorMessage
      v-if="error"
      :error="error"
    />
  </UForm>
</template>
