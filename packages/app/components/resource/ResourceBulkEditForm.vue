<script lang="ts" setup>
import { Dropdown } from 'floating-vue'
import type { ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'
import { isAnyOpen } from './resourceInstanceValueOverlays.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  instanceIds: string[]
}>()

const emit = defineEmits<{
  cancel: []
  submit: [value: any]
}>()

const instanceStore = useResourceInstanceStore()

const state = ref<Record<string, any>>({})

// Fields

function addField(field: ResourceSchemaField) {
  let value
  switch (field.type) {
    case 'string':
      value = ''
      break
    case 'number':
      value = 0
      break
    case 'boolean':
      value = false
      break
    case 'date':
      value = new Date()
      break
    default:
      value = null
  }
  if (field.array) {
    value = [value]
  }
  state.value[field.name] = value
}

function removeField(field: ResourceSchemaField) {
  delete state.value[field.name]
}

const filter = ref('')

const fields = computed(() => {
  if (props.resourceType.type !== 'object') {
    return
  }

  let result = Object.values(props.resourceType.fields)
  if (filter) {
    const reg = new RegExp(filter.value, 'i')
    result = result.filter(field => field.name.match(reg) || field.description?.match(reg) || field.tags.some(tag => tag.match(reg)))
  }
  return result
})

// Cancel

async function onCancel() {
  emit('cancel')
}

// Validate

function validate(_data: any) {
  // @TODO validate form data
  return []
}

// Submit

const toast = useToast()

async function onSubmit() {
  if (!Object.keys(state.value).length || validate(state.value).length) {
    return
  }

  await instanceStore.bulkUpdateInstances({
    resourceName: props.resourceType.name,
    instanceIds: props.instanceIds,
    data: {
      value: state.value,
    },
  })

  toast.add({
    id: 'resource-bulk-edit-form-success',
    color: 'green',
    title: `Updated ${props.instanceIds.length} ${props.resourceType.name} instance${props.instanceIds.length > 1 ? 's' : ''}`,
    icon: 'i-ph-pencil-simple',
  })

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
    v-if="resourceType.type === 'object'"
    :state="state"
    :validate="validate"
    class="flex flex-col gap-1"
    @submit="onSubmit"
  >
    <div class="pb-2">
      <UInput
        v-model="filter"
        icon="i-ph-funnel"
        placeholder="Filter fields..."
        autofocus
      />
    </div>

    <div
      v-for="field in fields"
      :key="field.name"
      class="p-1 rounded-md border"
      :class="[
        (field.name in state)
          ? 'border-gray-200 dark:border-gray-800'
          : 'border-transparent',
      ]"
    >
      <div
        v-if="!(field.name in state)"
        class="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer text-gray-500"
        @click="addField(field)"
      >
        <div class="flex-1 truncate text-sm">
          <template v-if="!(field.name in state)">
            {{ field.name }}
          </template>
        </div>

        <UButton
          color="gray"
          variant="link"
          :icon="field.name in state ? 'i-ph-minus' : 'i-ph-plus'"
          :padded="false"
          :aria-label="field.name in state ? `Remove '${field.name}' field from bulk edit` : `Add '${field.name}' field to bulk edit`"
        />
      </div>

      <div
        v-if="field.name in state"
        class="p-2"
      >
        <ResourceInstanceValueFormInput
          v-model="state[field.name]"
          :resource-type="resourceType"
          :field="field"
          autofocus
        >
          <template #hint-end>
            <UButton
              color="gray"
              variant="link"
              icon="i-ph-minus"
              :padded="false"
              :aria-label="`Remove '${field.name}' field from bulk edit`"
              @click="removeField(field)"
            />
          </template>
        </ResourceInstanceValueFormInput>
      </div>
    </div>

    <FormActions class="bottom-0">
      <UButton
        color="gray"
        @click="onCancel()"
      >
        Cancel
      </UButton>

      <UButton
        type="submit"
        icon="i-ph-pencil-simple"
        :disabled="!Object.keys(state).length"
      >
        Update {{ instanceIds.length }} instance{{ instanceIds.length > 1 ? 's' : '' }}

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
