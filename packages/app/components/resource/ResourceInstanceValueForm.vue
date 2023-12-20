<script lang="ts" setup>
import { Dropdown } from 'floating-vue'
import { isAnyOpen } from './resourceInstanceValueOverlays.js'
import type { ResourceInstance, ResourceSchemaType } from '@moquerie/core'

const props = defineProps<{
  resourceType: ResourceSchemaType
  instance?: ResourceInstance
}>()

const emit = defineEmits<{
  cancel: []
  submit: [value: any]
}>()

function getInitialState() {
  return structuredClone(toRaw(props.instance?.value ?? {}))
}

const state = ref<any>(getInitialState())

const stateChanged = ref(false)

watch(state, () => {
  stateChanged.value = true
}, {
  deep: true,
})

watch(() => props.instance, async () => {
  if (!stateChanged.value) {
    state.value = getInitialState()
    await nextTick()
    stateChanged.value = false
  }
})

// Cancel

async function onCancel() {
  emit('cancel')

  if (props.instance) {
    state.value = getInitialState()
    await nextTick()
    stateChanged.value = false
  }
}

// Validate

function validate(_data: any) {
  // @TODO validate form data
  return []
}

// Submit

async function onSubmit() {
  if (validate(state.value).length) {
    return
  }

  stateChanged.value = false
  emit('submit', state.value)
}

// Shortcuts

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      onSubmit()
    },
    whenever: [() => !isAnyOpen.value],
  },

  escape: {
    usingInput: true,
    handler: onCancel,
    whenever: [() => !isAnyOpen.value],
  },
})
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="flex flex-col gap-4"
    @submit="onSubmit()"
  >
    <div v-if="resourceType.type === 'object'" class="flex flex-col items-stretch gap-2">
      <ResourceInstanceValueFormInput
        v-for="([key, field], index) in Object.entries(resourceType.fields)"
        :key="key"
        v-model="state[field.name]"
        :resource-type="resourceType"
        :field="field"
        :autofocus="index === 0"
      />
    </div>
    <!-- @TODO other types -->

    <!-- @TODO sticky actions bar with focus scroll + offset -->
    <FormActions>
      <UButton
        color="gray"
        :disabled="instance && !stateChanged"
        @click="onCancel()"
      >
        Cancel
      </UButton>

      <UButton
        type="submit"
        :icon="instance ? 'i-ph-pencil-simple' : 'i-ph-plus'"
        :disabled="instance && !stateChanged"
      >
        {{ instance ? 'Update' : 'Create instance' }}

        <KbShortcut keys="meta_enter" />
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
            <pre class="break-all whitespace-pre-wrap">{{ state }}</pre>
          </div>
        </template>
      </Dropdown>
    </FormActions>
  </UForm>
</template>
