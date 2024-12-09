<script lang="ts" setup>
import type { ResourceFactoryField, ResourceSchemaType } from '@moquerie/core'
import { Dropdown } from 'floating-vue'
import * as monaco from 'monaco-editor'

const props = defineProps<{
  resourceType: ResourceSchemaType
  type: string
  factoryField: ResourceFactoryField
  array?: boolean
  fakerLocale?: string
}>()

const emit = defineEmits<{
  'update:factoryField': [factoryField: ResourceFactoryField]
}>()

const { data: factories, refresh } = await useFetch('/api/faker/factories')
onWindowFocus(refresh)

const previewError = ref<(Error & { data: { message: string } }) | null>(null)
const preview = computedAsync(async () => {
  const data = await $fetch('/api/faker/preview', {
    method: 'POST',
    body: {
      factory: props.factoryField.fakerFn,
      locale: props.fakerLocale,
      paramsCode: props.factoryField.fakerParams,
    },
  })
  previewError.value = null
  return data
}, undefined, {
  onError: (e: any) => {
    previewError.value = e
  },
})

const parsedFactory = computed(() => {
  const [category, ...names] = props.factoryField.fakerFn?.split('.') ?? []
  const name = names.join('.')
  return {
    category,
    name,
  }
})

const docUrl = computed(() => {
  const factory = props.factoryField.fakerFn
  if (factory) {
    const { category, name } = parsedFactory.value
    return `https://fakerjs.dev/api/${category}.html#${name.toLowerCase()}`
  }
  return null
})

function update(updated: Partial<ResourceFactoryField>) {
  const newValue: ResourceFactoryField = {
    ...props.factoryField,
    ...updated,
  }
  emit('update:factoryField', newValue)
}

// Options code

const fakeParamsSource = computed({
  get: () => props.factoryField.fakerParams ?? '',
  set: (value) => {
    update({ fakerParams: value })
  },
})

const fakerTypes = import.meta.glob('/node_modules/@faker-js/faker/dist/types/modules/**/index.d.ts?raw')

const fakerType = computedAsync(async () => {
  if (!props.factoryField.fakerFn) {
    return null
  }
  const { category } = parsedFactory.value
  const code = await fakerTypes[`/node_modules/@faker-js/faker/dist/types/modules/${category}/index.d.ts`]()
  // Find class name
  const className = code.match(/export declare class ([a-zA-Z]+)/)?.[1]
  return {
    code,
    className,
  }
})

// @TODO data context types (previous fields)

const fakerParamsWrapCode = computed(() => {
  let start
  const typing = fakerType.value
  if (typing) {
    const { category, name } = parsedFactory.value
    const uri = monaco.Uri.parse(`file:///faker-${category}.d.ts`)
    monaco.editor.getModels().filter(m => m.uri.fsPath === uri.fsPath).forEach(m => m.dispose())
    monaco.editor.createModel(typing.code, 'typescript', uri)
    start = `import { ${typing.className} } from './faker-${category}';const fn: (result: typeof ${typing.className}.prototype.${name}) => void = (${name}) => ${name}(`
  }
  else {
    start = `const fn: (result: (result: any) => void) => void = (result) => result(`
  }
  return {
    start,
    end: `)`,
  }
})

// @TODO SelectMenu popper captures all ArrowUp and ArrowDown events which breaks Shift+ArrowUp/Down shortcuts

// // Auto-open select

const select = ref()

// setTimeout(() => {
//   select.value?.$refs.trigger?.el.click()
// }, 300) // Timeout to takeover focus from other autofocus elements
</script>

<template>
  <div class="space-y-4">
    <UFormGroup label="Generator">
      <template #hint>
        <UButton
          v-if="docUrl"
          :to="docUrl"
          target="_blank"
          variant="link"
          trailing-icon="i-ph-arrow-square-out"
          size="xs"
          :padded="false"
        >
          Documentation
        </UButton>
      </template>

      <USelectMenu
        ref="select"
        searchable
        :model-value="factoryField.fakerFn"
        :options="factories!"
        @update:model-value="update({ fakerFn: $event })"
      />
    </UFormGroup>

    <template v-if="factoryField.fakerFn">
      <UFormGroup label="Parameters">
        <template #hint>
          <div class="text-xs flex items-center gap-1">
            <span>Hint with</span>
            <KbShortcut :keys="['meta', 'shift', 'space']" />
          </div>
        </template>

        <MonacoEditor
          v-model:source="fakeParamsSource"
          filename="fakerOptions.ts"
          :options="{
            language: 'typescript',
            lineNumbers: 'off',
            folding: false,
          }"
          :wrap-code="fakerParamsWrapCode"
          class="h-[50px] border border-gray-300 dark:border-gray-800"
        />
      </UFormGroup>

      <UFormGroup>
        <template #label>
          <div class="flex items-center gap-2">
            Preview
            <Dropdown v-if="previewError">
              <button class="text-red-500 hover:text-red-400 flex items-center gap-0.5">
                <UIcon name="i-ph-warning-circle w-4 h-4" />
                Error
              </button>

              <template #popper>
                <pre class="max-w-[300px] p-4 text-xs whitespace-pre-wrap text-red-500">{{ previewError.data?.message ?? previewError.message }}</pre>
              </template>
            </Dropdown>
          </div>
        </template>

        <div
          class="font-mono text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded w-full h-[100px] overflow-auto [&_img]:max-w-full [&_img]:max-h-[80px]"
        >
          <ValuePreview
            :value="preview"
            class="whitespace-pre-wrap"
          />
        </div>
      </UFormGroup>
    </template>

    <div v-else class="h-[200px] flex items-center justify-center">
      <div class="flex items-end p-6 gap-4 ">
        <UIcon name="i-ph-arrow-bend-left-up" class="w-10 h-10 flex-none text-primary-500" />
        <p>Select a faker generator to continue</p>
      </div>
    </div>
  </div>
</template>
