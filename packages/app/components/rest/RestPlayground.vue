<script lang="ts" setup>
import { vTooltip } from 'floating-vue'
import * as monaco from 'monaco-editor'

const path = useLocalStorage('moquerie.rest.playground.path', '')
const method = useLocalStorage('moquerie.rest.playground.method', 'GET')
const query = useLocalStorage('moquerie.rest.playground.query', {})
const body = useLocalStorage('moquerie.rest.playground.body', {})

function updateQuery(value: string) {
  try {
    query.value = JSON.parse(value)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    // noop
  }
}

function updateBody(value: string) {
  try {
    body.value = JSON.parse(value)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    // noop
  }
}

const result = useSessionStorage<any>('moquerie.rest.playground.result', {})
const error = ref<any>(null)
const pending = ref(false)

async function send() {
  error.value = null
  pending.value = true
  try {
    result.value = await $fetch('/api/rest/fetch', {
      method: 'POST',
      body: {
        path: path.value,
        method: method.value,
        query: query.value,
        body: body.value,
      },
    })
  }
  catch (e) {
    error.value = e
    result.value = null
  }
  pending.value = false
}

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: send,
  },
})

function onEditorSetup(editor: monaco.editor.IStandaloneCodeEditor) {
  // Send shortcut
  editor.addAction({
    id: 'send',
    label: 'Send request',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => {
      send()
    },
  })
}

// Saving

interface SavedQuery {
  name: string
  path: string
  method: string
  query: any
  body: any
}

const savedQueries = useLocalStorage<SavedQuery[]>('moquerie.rest.playground.savedQueries', [])
const savedQueryName = ref('')

function save() {
  if (!savedQueryName.value) {
    return
  }
  savedQueries.value.push({
    name: savedQueryName.value,
    path: path.value,
    method: method.value,
    query: query.value,
    body: body.value,
  })
  savedQueryName.value = ''
}

function remove(index: number) {
  savedQueries.value.splice(index, 1)
}

function load(savedQuery: SavedQuery) {
  path.value = savedQuery.path
  method.value = savedQuery.method
  query.value = savedQuery.query
  body.value = savedQuery.body
}

const searchSavedQuery = ref('')

const filteredSavedQueries = computed(() => {
  if (!searchSavedQuery.value) {
    return savedQueries.value
  }
  return savedQueries.value.filter((savedQuery) => {
    return savedQuery.name.toLowerCase().includes(searchSavedQuery.value.toLowerCase())
  })
})

const sortedSavedQueries = computed(() => {
  return filteredSavedQueries.value.slice().sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
})
</script>

<template>
  <div class="flex items-stretch divide-x divide-gray-200 dark:divide-gray-800">
    <div class="flex-1 w-0 max-w-[350px] p-4 flex flex-col gap-4 bg-gray-50 dark:bg-gray-800">
      <div class="flex gap-2">
        <UInput
          v-model="savedQueryName"
          placeholder="Save query with name..."
          class="flex-1 w-0"
          @keydown.enter="save()"
        />

        <UButton
          v-tooltip="'Save query'"
          :disabled="!savedQueryName"
          icon="i-ph-floppy-disk"
          variant="ghost"
          @click="save()"
        />
      </div>

      <hr class="border-gray-300 dark:border-gray-700">

      <UInput
        v-model="searchSavedQuery"
        name="query-name"
        placeholder="Search"
        trailing-icon="i-ph-magnifying-glass"
        variant="none"
      />

      <div class="flex-1 h-0 overflow-y-auto flex flex-col">
        <div
          v-for="(savedQuery, index) in sortedSavedQueries"
          :key="index"
          class="flex items-center pl-3 pr-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded select-none"
          @dblclick.prevent="load(savedQuery)"
        >
          <div class="flex-1 truncate cursor-default">
            {{ savedQuery.name }}
          </div>
          <UButton
            v-tooltip="'Delete'"
            icon="i-ph-trash-simple"
            color="red"
            variant="ghost"
            @click="remove(index)"
          />
          <UButton
            v-tooltip="'Load'"
            icon="i-ph-arrow-right"
            variant="ghost"
            @click="load(savedQuery)"
          />
          <UButton
            v-tooltip="'Load & Send'"
            icon="i-ph-play"
            variant="ghost"
            @click="load(savedQuery);send()"
          />
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="flex-1 w-0 p-4 flex flex-col gap-4 overflow-y-auto">
      <div class="flex items-center gap-1">
        <UIcon name="i-carbon-api" class="w-6 h-6 flex-none" />
        <h2 class="text-lg font-semibold">
          REST Playground
        </h2>

        <div class="flex-1" />

        <UButton
          icon="i-ph-play"
          :loading="pending"
          @click="send()"
        >
          Send
        </UButton>
      </div>

      <UFormGroup
        label="Path"
      >
        <UInput
          v-model="path"
          placeholder="Path"
          name="path"
        />
      </UFormGroup>

      <UFormGroup
        label="Method"
      >
        <RadioButtonGroup
          v-model="method"
          :options="[
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'PATCH', value: 'PATCH' },
            { label: 'DELETE', value: 'DELETE' },
          ]"
        />
      </UFormGroup>

      <UFormGroup
        label="Query"
      >
        <MonacoEditor
          filename="rest-playground-query.json"
          :source="JSON.stringify(query, null, 2)"
          :options="{
            language: 'json',
            lineNumbers: 'off',
            folding: false,
            wordWrap: 'on',
          }"
          class="h-[200px] border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden"
          @update:source="updateQuery($event)"
          @setup="onEditorSetup"
        />
      </UFormGroup>

      <UFormGroup
        label="Body"
      >
        <MonacoEditor
          filename="rest-playground-body.json"
          :source="JSON.stringify(body, null, 2)"
          :options="{
            language: 'json',
            lineNumbers: 'off',
            folding: false,
            wordWrap: 'on',
          }"
          class="h-[200px] border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden"
          @update:source="updateBody($event)"
          @setup="onEditorSetup"
        />
      </UFormGroup>
    </div>

    <!-- Result -->
    <div class="flex flex-col flex-1 w-0 gap-4">
      <div class="px-4 pt-4">
        Result
      </div>
      <ErrorMessageSimple
        v-if="error"
        :error="error"
        class="mx-4"
      />
      <MonacoEditor
        v-else-if="!pending || result != null"
        filename="rest-playground-result.json"
        :source="JSON.stringify(result, null, 2)"
        :options="{
          language: 'json',
          readOnly: true,
          lineNumbers: 'off',
          wordWrap: 'on',
        }"
        class="flex-1 h-0"
      />
    </div>
  </div>
</template>
