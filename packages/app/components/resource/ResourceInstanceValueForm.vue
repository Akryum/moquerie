<script lang="ts" setup>
import { Dropdown } from 'floating-vue'
import type { ResourceInstance, ResourceSchemaType } from '@moquerie/core'
import { isAnyOpen } from './resourceInstanceValueOverlays.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  instance?: ResourceInstance
}>()

const emit = defineEmits<{
  cancel: []
  submit: [value: any]
}>()

const { data: defaultValues } = await useFetch('/api/factories/defaultValues', {
  query: {
    resourceName: props.resourceType.name,
  },
})

const resourceTypeStore = useResourceTypeStore()

function getInitialState() {
  return {
    comment: props.instance?.comment ?? '',
    tags: props.instance?.tags ?? [],
    value: structuredClone(toRaw(props.instance?.value ?? defaultValues.value ?? {})),
  }
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

const tags = useTagModel(state.value, 'tags')

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

// Search

const MIN_COUNT_TO_ENABLE_SEARCH = 10

const searchField = useLocalStorage(`form-search-field-${props.resourceType.name}`, '')

const filteredFields = computed(() => {
  const result = Object.entries(props.resourceType.fields)

  if (result.length > MIN_COUNT_TO_ENABLE_SEARCH && searchField.value) {
    const reg = new RegExp(searchField.value, 'i')
    return result.filter(([key]) => {
      const field = props.resourceType.fields[key]
      return reg.test(key) || reg.test(field.description ?? '') || field.tags.some(tag => reg.test(tag))
    })
  }

  return result
})

const searchInputFocused = ref(false)
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    @submit="onSubmit()"
  >
    <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 p-2">
      <UFormGroup name="comment" label="Comment" hint="Add notes on this instance">
        <UTextarea v-model="state.comment" autoresize :rows="1" />
      </UFormGroup>

      <UFormGroup name="tags" label="Tags" hint="Separate tags with commas">
        <UInput v-model="tags" placeholder="tag1, tag2, tag3" />
      </UFormGroup>
    </div>

    <div class="flex flex-col gap-4 p-2">
      <div class="flex flex-col items-stretch gap-4">
        <div
          v-if="Object.keys(resourceType.fields).length > MIN_COUNT_TO_ENABLE_SEARCH"
          class="flex items-center justify-center gap-2 p-2"
        >
          <UInput
            v-model="searchField"
            icon="i-ph-magnifying-glass"
            placeholder="Search field..."
            size="xs"
            @focus="searchInputFocused = true"
            @blur="searchInputFocused = false"
          />
        </div>

        <ResourceInstanceValueFormInput
          v-for="([key, field], index) in filteredFields"
          :key="key"
          v-model="state.value[field.name]"
          :resource-type="resourceType"
          :child-resource-type="field.type === 'resource' ? resourceTypeStore.getResourceType(field.resourceName) : undefined"
          :field="field"
          :autofocus="index === 0 && !searchInputFocused"
          :show-apply="!!instance"
          :has-changes="instance && stateChanged"
          @apply="onSubmit()"
        />
      </div>

      <!-- @TODO sticky actions bar with focus scroll + offset -->
      <FormActions class="bottom-0">
        <UButton
          color="gray"
          :disabled="!instance || !stateChanged"
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
    </div>
  </UForm>
</template>
