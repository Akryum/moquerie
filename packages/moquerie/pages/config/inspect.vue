<script lang="ts" setup>
const { data, error, refresh } = await useFetch('/api/config/inspect')
onWindowFocus(refresh)

const source = ref<string>('')
const file = ref<string | null>(null)

async function readConfigSource() {
  const result = await $fetch('/api/config/file/read')
  source.value = result.content
  file.value = result.file
}

readConfigSource()
onWindowFocus(readConfigSource)

watchDebounced(source, writeConfigSource, {
  debounce: 1000,
})

async function writeConfigSource() {
  await $fetch('/api/config/file/write', {
    method: 'POST',
    body: {
      source: source.value,
    },
  })
  await refresh()
  triggerConfigChange()
}

function openFile() {
  return $fetch('/api/openInEditor', {
    params: {
      file: file.value,
    },
  })
}
</script>

<template>
  <div class="overflow-hidden flex items-stretch divide-x divide-gray-300 dark:divide-gray-600 dark:bg-gray-800">
    <div class="flex-1 flex flex-col">
      <ULink
        class="flex items-center gap-1 justify-center text-sm py-0.5 hover:underline hover:text-primary-500"
        @click="openFile()"
      >
        <UIcon name="i-ph-file" />
        {{ file }}
      </ULink>
      <MonacoEditor
        v-model:source="source"
        filename="moquerie.config.ts"
        :options="{
          language: 'typescript',
        }"
        class="h-full"
      />
    </div>
    <div class="flex-1 flex flex-col">
      <div class="flex items-center gap-1 justify-center text-sm py-0.5">
        <UIcon name="i-ph-eye" />
        Resolved config
      </div>
      <ErrorMessage v-if="error" :error="error" />
      <MonacoEditor
        v-else
        filename="resolved-config.json"
        :source="JSON.stringify(data, null, 2)"
        :options="{
          readOnly: true,
          language: 'json',
        }"
        class="h-full"
      />
    </div>
  </div>
</template>
