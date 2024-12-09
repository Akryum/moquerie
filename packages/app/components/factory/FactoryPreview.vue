<script lang="ts" setup>
import type { FactoryData } from './formTypes.js'
import { Dropdown } from 'floating-vue'

const props = defineProps<{
  factory: FactoryData
}>()

const preview = ref<any>(null)
const error = ref<any>(null)

const fetchPreview = useDebounceFn(async () => {
  try {
    const data = await $fetch('/api/factories/preview', {
      method: 'POST',
      body: props.factory,
      parseResponse: r => r,
    })
    preview.value = data
    error.value = null
  }
  catch (e: any) {
    error.value = {
      ...e,
      data: e.data ? JSON.parse(e.data) : null,
    }
  }
}, 200)

watch(() => props.factory, () => {
  fetchPreview()
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <span>Preview</span>
      <Dropdown v-if="error">
        <button class="text-red-500 hover:text-red-400 flex items-center gap-0.5">
          <UIcon name="i-ph-warning-circle w-4 h-4" />
          Error
        </button>

        <template #popper>
          <pre class="max-w-[300px] p-4 text-xs whitespace-pre-wrap text-red-500">{{ error.data?.message ?? error.message }}</pre>
        </template>
      </Dropdown>

      <UButton
        icon="i-ph-arrows-clockwise"
        :padded="false"
        variant="link"
        @click="fetchPreview()"
      />
    </div>

    <MonacoEditor
      v-if="preview"
      filename="factory.instance-preview.json"
      :source="preview"
      :options="{
        language: 'json',
        readOnly: true,
        lineNumbers: 'off',
      }"
      class="w-full h-full flex-1 border border-gray-300 dark:border-gray-800"
    />
  </div>
</template>
