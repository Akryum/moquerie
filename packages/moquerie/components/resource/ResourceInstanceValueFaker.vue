<script lang="ts" setup>
import * as monaco from 'monaco-editor'
import { Dropdown, VTooltip as vTooltip } from 'floating-vue'
import { isFakerOpen } from './resourceInstanceValueOverlays.js'

const props = defineProps<{
  array?: boolean
  previousFactory?: string
  previousLocale?: string
  previousParamsCode?: string
}>()

const emit = defineEmits<{
  'cancel': []
  'generate': [any, { factory: string, locale?: string, paramsCode?: string }]
}>()

// Faker locales

const fakerLocale = ref<string | undefined>(props.previousLocale)

const { data: fakerLocales } = await useFetch('/api/faker/locales')

const fakerLocaleOptions = computed(() => {
  return [
    {
      label: 'Default',
      value: undefined,
    },
    ...Object.keys(fakerLocales.value ?? {}).map(key => ({
      label: fakerLocales.value?.[key].name,
      value: key,
    })),
  ]
})

// Factory

const fakerFactory = ref<string | undefined>(props.previousFactory)

const fakerOptions = ref<string>(props.previousParamsCode ?? '')

const { data: factories, refresh } = await useFetch('/api/faker/factories')
onWindowFocus(refresh)

const previewError = ref<(Error & { data: { message: string } }) | null>(null)

const preview = ref<any>()

async function fetchPreview() {
  try {
    if (!fakerFactory.value) {
      return null
    }
    const data = await $fetch('/api/faker/preview', {
      method: 'POST',
      body: {
        factory: fakerFactory.value,
        locale: fakerLocale.value,
        paramsCode: fakerOptions.value,
      },
    })
    previewError.value = null
    preview.value = data
  }
  catch (e: any) {
    previewError.value = e
  }
}

watchEffect(() => {
  fetchPreview()
})

const parsedFactory = computed(() => {
  const [category, ...names] = fakerFactory.value?.split('.') ?? []
  const name = names.join('.')
  return {
    category,
    name,
  }
})

const docUrl = computed(() => {
  const factory = fakerFactory.value
  if (factory) {
    const { category, name } = parsedFactory.value
    return `https://fakerjs.dev/api/${category}.html#${name.toLowerCase()}`
  }
})

function onSubmit() {
  if (!previewError.value) {
    emit('generate', preview.value, {
      factory: fakerFactory.value!,
      locale: fakerLocale.value,
      paramsCode: fakerOptions.value,
    })
  }
}

// Options code

const fakerTypes = import.meta.glob('/node_modules/@faker-js/faker/dist/types/modules/**/index.d.ts', {
  as: 'raw',
})

const fakerType = computedAsync(async () => {
  if (!fakerFactory.value) {
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

const fakerOptionsWrapCode = computed(() => {
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

// Array

// @TODO

// const fakerCountType = computed({
//   get: () => typeof props.value.fakerCount === 'number' || props.value.fakerCount == null ? 'static' : 'random',
//   set: (value) => {
//     const currentValue = props.value.fakerCount == null
//       ? 1
//       : typeof props.value.fakerCount === 'number'
//         ? props.value.fakerCount
//         : props.value.fakerCount.min
//     if (value === 'static') {
//       update({ fakerCount: currentValue })
//     }
//     else {
//       update({ fakerCount: { min: currentValue, max: currentValue } })
//     }
//   },
// })

// interface RandomFakerCount {
//   min: number
//   max: number
// }

// Shortcuts

defineShortcuts({
  escape: {
    usingInput: true,
    handler: () => {
      emit('cancel')
    },
  },

  meta_enter: {
    usingInput: true,
    handler: () => {
      onSubmit()
    },
  },

  meta_r: {
    usingInput: true,
    handler: () => {
      fetchPreview()
    },
  },
})

// Is open

onMounted(() => {
  isFakerOpen.value = true
})

onBeforeUnmount(() => {
  isFakerOpen.value = false
})

// Autofocus

const factorySelectMenu = ref<any>()

onMounted(() => {
  setTimeout(() => {
    factorySelectMenu.value?.$refs.trigger?.el.click()
  }, 100)
})
</script>

<template>
  <div class="space-y-4">
    <UFormGroup name="fakerLocale" label="Faker locale">
      <USelectMenu
        v-model="fakerLocale"
        :options="fakerLocaleOptions"
        searchable
        value-attribute="value"
      >
        <template #label>
          {{ fakerLocales?.[fakerLocale ?? '']?.name ?? 'Default' }}
        </template>
      </USelectMenu>
    </UFormGroup>

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
        ref="factorySelectMenu"
        v-model="fakerFactory"
        searchable
        :options="factories!"
      />
    </UFormGroup>

    <template v-if="fakerFactory">
      <UFormGroup label="Parameters">
        <template #hint>
          <div class="text-xs flex items-center gap-1">
            <span>Hint with</span>
            <KbShortcut :keys="['meta', 'shift', 'space']" />
          </div>
        </template>

        <MonacoEditor
          v-model:source="fakerOptions"
          filename="fakerOptions.ts"
          :options="{
            language: 'typescript',
            lineNumbers: 'off',
            folding: false,
          }"
          :wrap-code="fakerOptionsWrapCode"
          class="h-[50px] border border-gray-300 dark:border-gray-700"
        />
      </UFormGroup>

      <UFormGroup>
        <template #label>
          <div class="flex items-center gap-2">
            Generated value
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

        <template #hint>
          <UButton
            v-if="!previewError"
            v-tooltip="'Refresh value'"
            color="gray"
            variant="ghost"
            icon="i-ph-arrows-clockwise"
            @click="fetchPreview()"
          >
            <KbShortcut keys="meta_r" />
          </UButton>
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

      <!-- @TODO handle enforce unique -->

      <!-- <div class="p-2 flex items-center gap-2">
        <UToggle
          :model-value="value.fakerEnforceUnique ?? false"
          @update:model-value="update({ fakerEnforceUnique: $event })"
        />
        Enforce uniqueness
      </div> -->

      <!-- @TODO handle array -->

      <!-- <UFormGroup v-if="array" label="Number of generated items">
        <div class="flex items-center gap-2">
          <URadioGroup
            v-model="fakerCountType"
            :options="[
              {
                value: 'static',
                label: 'Static count',
              },
              {
                value: 'random',
                label: 'Random count',
              },
            ]"
            class="flex-1"
            aria-label="Type of count"
          />

          <UInput
            v-if="fakerCountType === 'static'"
            type="number"
            :model-value="typeof value.fakerCount === 'number' ? value.fakerCount : 1"
            @update:model-value="update({ fakerCount: $event })"
          />

          <div
            v-else
            class="flex items-center"
          >
            <UInput
              type="number"
              :model-value="(value.fakerCount as RandomFakerCount)?.min ?? 1"
              class="w-[120px] relative left-px"
              aria-label="Min"
              :ui="{
                rounded: 'rounded-r-none',
                leading: {
                  padding: {
                    sm: 'ps-11',
                  },
                },
              }"
              @update:model-value="update({ fakerCount: { min: $event, max: (value.fakerCount as RandomFakerCount)?.max ?? $event } })"
            >
              <template #leading>
                <div class="text-sm uppercase text-gray-500">
                  Min
                </div>
              </template>
            </UInput>
            <UInput
              type="number"
              :model-value="(value.fakerCount as RandomFakerCount)?.max ?? 1"
              class="w-[120px]"
              aria-label="Max"
              :ui="{
                rounded: 'rounded-l-none',
                leading: {
                  padding: {
                    sm: 'ps-11',
                  },
                },
              }"
              @update:model-value="update({ fakerCount: { min: (value.fakerCount as RandomFakerCount)?.min ?? $event, max: $event } })"
            >
              <template #leading>
                <div class="text-sm uppercase text-gray-500">
                  Max
                </div>
              </template>
            </UInput>
          </div>
        </div>
      </UFormGroup> -->
    </template>

    <div v-else class="h-[200px] flex items-center justify-center">
      <div class="flex items-end p-6 gap-4 ">
        <UIcon name="i-ph-arrow-bend-left-up" class="w-10 h-10 flex-none text-primary-500" />
        <p>Select a faker generator to continue</p>
      </div>
    </div>

    <FormActions>
      <UButton
        color="gray"
        @click="$emit('cancel')"
      >
        Cancel
      </UButton>

      <UButton
        icon="i-ph-arrow-square-down"
        :disabled="!fakerFactory || !!previewError"
        @click="onSubmit()"
      >
        Insert

        <KbShortcut keys="meta_enter" />
      </UButton>
    </FormActions>
  </div>
</template>
