<script lang="ts" setup>
import { Dropdown, Menu, Tooltip } from 'floating-vue'
import type { ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'
import * as monaco from 'monaco-editor'

// @TODO Handle required/non-null fields

const props = defineProps<{
  resourceType: ResourceSchemaType
  field: ResourceSchemaField
  childResourceType?: ResourceSchemaType
  modelValue: any
  autofocus?: boolean
  showApply?: boolean
  hasChanges?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'apply': []
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

  if (props.field.array) {
    value = [...props.modelValue ?? [], value]
  }

  emit('update:modelValue', value)
  previousFakerSelection.value = previousSelection
  focusInput()
}

// Resource references

const isResourceRefsOpen = ref(false)

// Array

function addNewArrayItem() {
  if (!props.field.array || props.field.type === 'resource') {
    return
  }

  let value: any
  switch (props.field.type) {
    case 'boolean':
      value = false
      break
    case 'number':
      value = 0
      break
    case 'string':
      value = ''
      break
    case 'date':
      value = new Date()
      break
    default:
      value = null
  }

  emit('update:modelValue', [...props.modelValue ?? [], value])
}

function updateArrayItem(index: number, value: any) {
  const newValue = [...props.modelValue]
  newValue[index] = value
  emit('update:modelValue', newValue)
}

function removeArrayItem(index: number) {
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}

// Code editor

const editCode = ref(false)

function setupEditor(editor: monaco.editor.IStandaloneCodeEditor) {
  editor.focus()
  editor.setSelection(editor.getModel()?.getFullModelRange() ?? new monaco.Range(1, 1, 1, 1))

  // Close on escape
  editor.addAction({
    id: 'close',
    label: 'Close',
    keybindings: [monaco.KeyCode.Escape],
    run: () => {
      editCode.value = false
    },
  })
}

function onSourceUpdate(source: string) {
  try {
    emit('update:modelValue', JSON.parse(source))
  }
  catch (e) {
    console.warn(e)
  }
}

// Quick set

const allSameTypes = computed(() => {
  if (!props.childResourceType) {
    return false
  }
  const [first, ...rest] = Object.values(props.childResourceType.fields)
  if (!first) {
    return false
  }
  for (const field of rest) {
    if (field.type !== first.type) {
      return false
    }
  }
  return true
})

const setAllToShown = ref(false)

function setAllTo(value: any) {
  setAllToShown.value = false

  if (props.field.array) {
    // @TODO
    return
  }

  const result: any = {}
  for (const key in props.childResourceType?.fields) {
    result[key] = value
  }
  emit('update:modelValue', result)
}
</script>

<template>
  <UFormGroup class="group">
    <template #label>
      <div class="mb-0.5 flex items-center gap-2 group-hover:text-primary-500 group-focus-within:text-primary-500">
        <span
          :class="{
            'line-through': field.isDeprecated,
          }"
        >{{ field.name }}</span>

        <ResourceFieldInfoIcons
          :field="field"
          :resource-type="resourceType"
          :child-resource-type="childResourceType"
        />
      </div>
    </template>

    <template v-if="field.description">
      <div class="mb-0.5 text-xs text-gray-500">
        {{ field.description }}
      </div>
    </template>

    <template #hint>
      <div class="flex items-center leading-[0] gap-0.5">
        <Dropdown
          v-if="!['resource', 'boolean', 'enum'].includes(field.type)"
          v-model:shown="fakerOpen"
          placement="left-end"
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

        <Tooltip v-if="field.array && field.type !== 'resource'">
          <UButton
            icon="i-ph-plus"
            color="gray"
            variant="link"
            :padded="false"
            @click="addNewArrayItem()"
          />

          <template #popper>
            Add new item
          </template>
        </Tooltip>

        <template v-if="field.type === 'resource' && childResourceType?.inline">
          <template v-if="field.array">
            <UButton
              v-if="editCode"
              icon="i-ph-check-circle"
              color="gray"
              variant="link"
              :padded="false"
              @click="editCode = false"
            />
            <UButton
              v-else
              icon="i-ph-pencil-simple"
              color="gray"
              variant="link"
              :padded="false"
              @click="editCode = true"
            />
          </template>

          <template v-else>
            <UButton
              v-if="allSameTypes"
              color="gray"
              variant="link"
              :padded="false"
              @click="setAllToShown = true"
            >
              Set all to...
            </UButton>
          </template>
        </template>

        <slot name="hint-end" />
      </div>
    </template>

    <template v-if="field.type === 'resource'">
      <template v-if="childResourceType?.inline">
        <template v-if="field.array">
          <MonacoEditor
            v-if="editCode"
            :filename="`field-${resourceType.name}-${field.name}-inline-edit.js`"
            :source="JSON.stringify(modelValue, null, 2)"
            :options="{
              language: 'json',
              lineNumbers: 'off',
              folding: false,
              wordWrap: 'on',
            }"
            class="h-[200px] border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden"
            @update:source="onSourceUpdate"
            @setup="setupEditor"
          />
          <pre
            v-else
            class="text-xs text-gray-700 dark:text-gray-400 whitespace-pre-wrap"
            @dblclick="editCode = true"
            v-text="JSON.stringify(modelValue, null, 2)"
          />
        </template>

        <ResourceInstanceValueNestedForm
          v-else
          :model-value="modelValue"
          :field="field"
          :resource-type="resourceType"
          :child-resource-type="childResourceType"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </template>
      <Menu
        v-else
        placement="left"
        :delay="500"
        :dispose-timeout="0"
        :triggers="['hover']"
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
          <ResourceReferencesPreview
            v-if="childResourceType"
            :field="field"
            :value="modelValue"
            :resource-type="childResourceType"
            class="max-w-[800px] min-h-[200px] max-h-[600px]"
          />
          <div v-else class="p-2">
            Resource type not found
          </div>
        </template>
      </Menu>
    </template>

    <template v-else>
      <div v-if="field.array" class="flex flex-col gap-1">
        <div
          v-for="(item, index) in modelValue ?? []"
          :key="index"
          class="flex items-center gap-2 pr-1 border border-gray-200 dark:border-gray-800 rounded-md"
        >
          <div
            v-if="field.type === 'boolean'"
            @click="updateArrayItem(index, $event)"
          >
            <UToggle
              :model-value="item"
              class="pointer-events-none"
            />
          </div>

          <ResourceEnumSelect
            v-else-if="field.type === 'enum'"
            :model-value="item"
            :field="field"
            @update:model-value="updateArrayItem(index, $event)"
          />

          <UTextarea
            v-else
            ref="input"
            :model-value="item"
            :autofocus="autofocus"
            :name="field.name"
            :rows="1"
            autoresize
            variant="none"
            class="flex-1"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            @update:model-value="updateArrayItem(index, $event)"
          />

          <UButton
            icon="i-ph-trash"
            color="gray"
            variant="link"
            :padded="false"
            @click="removeArrayItem(index)"
          />
        </div>
      </div>
      <template v-else>
        <div
          v-if="field.type === 'boolean'"
          @click="$emit('update:modelValue', !modelValue)"
        >
          <UToggle
            :model-value="modelValue"
            class="pointer-events-none"
          />
        </div>

        <ResourceEnumSelect
          v-else-if="field.type === 'enum'"
          :model-value="modelValue"
          :field="field"
          @update:model-value="$emit('update:modelValue', $event)"
        />

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
      :show-apply="showApply"
      :has-changes="hasChanges"
      class="h-full"
      @update:model-value="$emit('update:modelValue', $event)"
      @close="isResourceRefsOpen = false"
      @apply="$emit('apply')"
    />
  </UModal>

  <UModal
    v-model="setAllToShown"
  >
    <ResourceInstanceValueFormSetAll
      v-if="field.type === 'resource'"
      :resource-type="resourceType"
      :child-resource-type="childResourceType!"
      :field="field"
      @cancel="setAllToShown = false"
      @submit="setAllTo($event)"
    />
  </UModal>
</template>
