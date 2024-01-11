<script lang="ts" setup>
import type { ResourceInstance } from '@moquerie/core'
import { Tooltip, vTooltip } from 'floating-vue'
import * as monaco from 'monaco-editor'

useHead({
  title: 'Publish to a channel',
})

// Suggest channels

const { data: channels, refresh } = await useFetch('/api/pubsub/suggestChannels')
onWindowFocus(refresh)

// Form

const hasGraphQL = await useHasGraphql()

const type = useLocalStorage('pubsub.publish.type', hasGraphQL ? 'graphql' : 'rest')
const channel = useLocalStorage('pubsub.publish.channel', '')
const payload = useLocalStorage('pubsub.publish.payload', '{}')

// History items

interface HistoryItem {
  type: string
  channel: string
  payload: string
}

const history = useLocalStorage<Array<HistoryItem>>('pubsub.publish.history', [])

// Publish

const error = ref<any>(null)

const toast = useToast()

async function publish() {
  if (!channel.value) {
    return
  }

  try {
    error.value = null
    await $fetch('/api/pubsub/publish', {
      method: 'POST',
      body: {
        type: type.value,
        channel: channel.value,
        payload: JSON.parse(payload.value),
      },
    })

    toast.add({
      title: 'Published',
      description: `Published to channel ${channel.value} successfully`,
      icon: 'i-ph-check-circle',
      color: 'green',
    })

    const index = history.value.findIndex(item => item.type === type.value && item.channel === channel.value && item.payload === payload.value)
    if (index !== -1) {
      history.value.splice(index, 1)
    }

    history.value.unshift({
      type: type.value,
      channel: channel.value,
      payload: payload.value,
    })
  }
  catch (e) {
    error.value = e
  }
}

let editor: monaco.editor.IStandaloneCodeEditor | undefined

function onEditorSetup(_editor: monaco.editor.IStandaloneCodeEditor) {
  editor = _editor
  editor.addAction({
    id: 'publish',
    label: 'Publish to channel',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => {
      publish()
    },
  })
}

function formatCode() {
  editor?.getAction('editor.action.formatDocument')?.run()
}

// Insert ref

const selectRefShown = ref(false)

function insertRef(resource: ResourceInstance) {
  selectRefShown.value = false
  if (editor) {
    // Insert reference to instance
    const selection = editor.getSelection() ?? new monaco.Selection(1, 1, 1, 1)
    editor.executeEdits('user', [
      {
        range: selection,
        text: JSON.stringify({
          __resourceName: resource.resourceName,
          __id: resource.id,
        }, null, 2),
        forceMoveMarkers: true,
      },
    ])
    formatCode()
    setTimeout(() => {
      editor?.focus()
    }, 500)
  }
}

// History

const searchHistory = useLocalStorage('pubsub.publish.history.search', '')

const filteredHistoryItems = computed(() => {
  if (!searchHistory.value) {
    return history.value
  }
  const reg = new RegExp(searchHistory.value, 'i')
  return history.value.filter(item => reg.test(item.channel) || reg.test(item.type) || reg.test(item.payload))
})

function applyHistoryItem(item: HistoryItem) {
  type.value = item.type
  channel.value = item.channel
  payload.value = item.payload
}

function removeHistoryItem(item: HistoryItem) {
  const index = history.value.findIndex(i => i.type === item.type && i.channel === item.channel && i.payload === item.payload)
  if (index !== -1) {
    history.value.splice(index, 1)
  }
}

// Shortcut

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: publish,
    whenever: [() => !selectRefShown.value],
  },
})
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <h1 class="text-xl flex items-center gap-2 p-4">
      <UIcon name="i-ph-broadcast" class="w-5 h-5 flex-none text-primary-500" />
      Publish to a channel
    </h1>

    <div class="flex h-full flex-1 gap-8">
      <div class="flex flex-col gap-4 max-w-[600px] flex-1 h-full overflow-y-auto p-4 pr-2">
        <UFormGroup
          label="Type"
        >
          <RadioButtonGroup
            v-model="type"
            :button-attrs="{
              color: 'gray',
              block: true,
            }"
            :options="[
              { label: 'REST', value: 'rest' },
              { label: 'GraphQL', value: 'graphql' },
            ]"
            class="w-full"
          />
        </UFormGroup>

        <UFormGroup
          label="Channel"
        >
          <UInputMenu
            v-model="channel"
            :options="channels ?? []"
            autofocus
          />
        </UFormGroup>

        <UFormGroup
          label="Payload"
        >
          <template #hint>
            <div class="flex items-center gap-1">
              <UButton
                v-tooltip="'Format code'"
                icon="i-ph-brackets-curly"
                variant="link"
                :padded="false"
                @click="formatCode()"
              />

              <UButton
                v-tooltip="'Insert reference to instance'"
                icon="i-ph-database"
                variant="link"
                :padded="false"
                @click="selectRefShown = true"
              />
            </div>
          </template>

          <MonacoEditor
            v-model:source="payload"
            filename="pubsub-payload.json"
            :options="{
              language: 'json',
              lineNumbers: 'off',
              folding: false,
            }"
            class="h-[400px] border border-gray-200 dark:border-gray-700"
            @setup="onEditorSetup"
          />
        </UFormGroup>

        <FormActions class="bottom-0">
          <UButton
            :disabled="!channel"
            @click="publish()"
          >
            Publish

            <KbShortcut keys="meta_enter" />
          </UButton>
        </FormActions>

        <ErrorMessage
          v-if="error"
          :error="error"
        />
      </div>

      <!-- History -->
      <div class="flex flex-col flex-1 gap-2 overflow-y-auto p-4 pl-2 max-w-[800px]">
        <div>
          <UInput
            v-model="searchHistory"
            placeholder="Search history"
            icon="i-ph-magnifying-glass"
          />
        </div>

        <Tooltip
          v-for="(item, index) in filteredHistoryItems"
          :key="index"
          placement="left-start"
        >
          <div class="flex items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <UIcon name="i-ph-clock-clockwise" class="w-6 h-6 flex-none opacity-50" />
            <div class="flex-1 truncate">
              <span class="opacity-50">{{ item.type }}:</span>{{ item.channel }}
            </div>
            <UButton
              icon="i-ph-trash"
              color="gray"
              variant="ghost"
              @click="removeHistoryItem(item)"
            />
            <UButton
              icon="i-ph-pencil"
              color="gray"
              variant="ghost"
              @click="applyHistoryItem(item)"
            >
              Edit
            </UButton>
            <UButton
              icon="i-ph-paper-plane-tilt"
              color="gray"
              @click="applyHistoryItem(item);publish()"
            >
              Send
            </UButton>
          </div>

          <template #popper>
            <pre>{{ item.payload }}</pre>
          </template>
        </Tooltip>
      </div>
    </div>

    <UModal
      v-model="selectRefShown"
      :ui="{
        width: 'sm:w-[calc(100vw-200px)] sm:max-w-[1200px]',
        height: 'sm:h-[calc(100vh-200px)] sm:max-h-[600px]',
      }"
    >
      <ResourceSelect
        class="h-full"
        @cancel="selectRefShown = false"
        @select="insertRef"
      />
    </UModal>
  </div>
</template>
