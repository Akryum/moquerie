<script lang="ts" setup>
import { Dropdown, Menu, Tooltip } from 'floating-vue'
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

// Resource references

const isResourceRefsOpen = ref(false)
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

    <Menu
      v-if="field.type === 'resource'"
      placement="left"
      :delay="500"
      :dispose-timeout="0"
    >
      <template #default="{ shown, hide }">
        <UButton
          ref="editReferencesButton"
          color="gray"
          block
          :class="{
            'ring-2 ring-gray-500/50': shown,
          }"
          @click="hide({ skipDelay: true });isResourceRefsOpen = true"
        >
          <ResourceReferencesSummary
            :field="field"
            :value="modelValue"
          />
        </UButton>
      </template>

      <template #popper>
        <div class="p-2 flex items-center gap-2 justify-center text-gray-500">
          <UIcon name="i-ph-mouse" class="w-4 h-4" />
          Click to edit references
        </div>

        <ResourceReferencesPreview
          :field="field"
          :value="modelValue"
          class="max-w-[600px] min-h-[200px] max-h-[600px]"
        />
      </template>
    </Menu>

    <template v-else>
      <!-- @TODO handle array -->

      <div
        v-if="field.type === 'boolean'"
        @click="$emit('update:modelValue', !modelValue)"
      >
        <UToggle
          :model-value="modelValue"
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

  <UModal
    v-model="isResourceRefsOpen"
    :ui="{
      width: 'sm:max-w-[calc(100vw-100px)]',
      height: 'h-[calc(100vh-80px)]',
    }"
  >
    <ResourceInstanceValueReferences
      v-if="field.type === 'resource'"
      :resource-type="resourceType"
      :field="field"
      :model-value="modelValue"
      class="h-full"
      @update:model-value="$emit('update:modelValue', $event)"
      @close="isResourceRefsOpen = false"
    />
  </UModal>
</template>
