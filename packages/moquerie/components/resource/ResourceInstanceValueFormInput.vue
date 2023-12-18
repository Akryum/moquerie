<script lang="ts" setup>
import { Dropdown, Tooltip, VTooltip as vTooltip } from 'floating-vue'
import type { ResourceSchemaField, ResourceSchemaType } from '~/types/resource.js'

// @TODO Handle required/non-null fields

const props = defineProps<{
  resourceType: ResourceSchemaType
  field: ResourceSchemaField
  modelValue: any
  autofocus?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const editReferencesButton = ref<any>()

defineExpose({
  editReferencesButton,
})

onMounted(() => {
  if (props.autofocus && editReferencesButton.value) {
    setTimeout(() => {
      editReferencesButton.value?.$el?.focus()
    }, 100) // Default NuxtUI autofocusDelay
  }
})

// Faker generator

const inputFocused = ref(false)
const fakerOpen = ref(false)

const previousFakerSelection = ref<{
  factory: string
  locale?: string
  paramsCode?: string
} | null>(null)

defineShortcuts({
  meta_g: {
    usingInput: true,
    handler: () => {
      fakerOpen.value = true
    },
    whenever: [inputFocused],
  },
})

const input = ref<any>()

function focusInput() {
  setTimeout(() => {
    input.value?.$refs.textarea?.focus()
    input.value?.$refs.textarea?.select()
  }, 100)
}

function onGenerate(value: any, previousSelection: {
  factory: string
  locale?: string
  paramsCode?: string
}) {
  fakerOpen.value = false
  emit('update:modelValue', value)
  previousFakerSelection.value = previousSelection
  focusInput()
}
</script>

<template>
  <UFormGroup
    :label="field.name"
    :description="field.description"
  >
    <template v-if="!['resource', 'boolean'].includes(field.type)" #hint>
      <Dropdown
        v-model:shown="fakerOpen"
        placement="bottom-end"
        :dispose-timeout="0"
        class="leading-[0]"
      >
        <Tooltip>
          <UButton
            icon="i-ph-dice-three"
            color="gray"
            variant="link"
            :padded="false"
            tabindex="-1"
          />

          <template #popper>
            Generate with faker

            <KbShortcut keys="meta_g" />
          </template>
        </Tooltip>

        <template #popper="{ hide }">
          <div class="p-4 pb-2 w-[400px]">
            <ResourceInstanceValueFaker
              :array="field.array"
              :previous-factory="previousFakerSelection?.factory"
              :previous-locale="previousFakerSelection?.locale"
              :previous-params-code="previousFakerSelection?.paramsCode"
              @cancel="hide();focusInput()"
              @generate="onGenerate"
            />
          </div>
        </template>
      </Dropdown>
    </template>

    <UButton
      v-if="field.type === 'resource'"
      ref="editReferencesButton"
      v-tooltip="'Edit references'"
      color="gray"
      block
    >
      <ResourceReferencesPreview
        :field="field"
        :value="modelValue"
      />
    </UButton>

    <template v-else>
      <!-- @TODO handle array -->

      <div
        v-if="field.type === 'boolean'"
        @click="$emit('update:modelValue', !modelValue)"
      >
        <UCheckbox
          :model-value="modelValue"
          :label="field.name"
          class="pointer-events-none"
        />
      </div>

      <UTextarea
        v-else
        ref="input"
        :model-value="modelValue"
        :autofocus="autofocus"
        :name="field.name"
        :rows="1"
        autoresize
        @focus="inputFocused = true"
        @blur="inputFocused = false"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </template>
  </UFormGroup>
</template>
