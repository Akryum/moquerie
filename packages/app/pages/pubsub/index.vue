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

const { metaSymbol } = useShortcuts()

function onEditorSetup(_editor: monaco.editor.IStandaloneCodeEditor) {
  editor = _editor

  // Publish shortcut

  editor.addAction({
    id: 'publish',
    label: 'Publish to channel',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => {
      publish()
    },
  })

  // Insert resource ref shortcut

  editor.addAction({
    id: 'insert-ref',
    label: 'Insert a resource reference',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
    run: () => {
      selectRefShown.value = true
    },
  })

  // Decoration for resource instance references

  const decorationCollection = editor.createDecorationsCollection()

  function updateDecorations() {
    if (!editor) {
      return
    }

    decorationCollection.clear()

    const decorations: monaco.editor.IModelDeltaDecoration[] = []
    const model = editor.getModel()
    if (!model) {
      return
    }

    // Search for code with object of the form { __resourceName: '...', __id: '...' }
    const reg = /{[\s\n]*"__resourceName"[\s\n]*:[\s\n]*"([^"]+)"[\s\n]*,[\s\n]*"__id"[\s\n]*:[\s\n]*"([^"]+)"[\s\n]*}/g
    const text = editor.getValue()
    let match
    // eslint-disable-next-line no-cond-assign
    while (match = reg.exec(text)) {
      // const resourceName = match[1]
      const positionStart = model.getPositionAt(match.index)
      const positionEnd = model.getPositionAt(match.index + match[0].length)
      decorations.push({
        range: new monaco.Range(
          positionStart.lineNumber,
          positionStart.column,
          positionEnd.lineNumber,
          positionEnd.column,
        ),
        options: {
          isWholeLine: false,
          after: {
            content: '  ',
            inlineClassName: 'moquerie-code-editor-resource-ref-icon',
          },
          inlineClassName: 'moquerie-code-editor-resource-ref',
          hoverMessage: {
            value: `<b>${metaSymbol.value} + click</b> to select another resource instance`,
            supportHtml: true,
          },
        },
      })
    }

    decorationCollection.append(decorations)
  }

  editor.onDidChangeModelContent(() => {
    updateDecorations()
  })
  updateDecorations()

  editor.onMouseUp(({ event }) => {
    if (!event.metaKey && !event.ctrlKey) {
      return
    }

    if (!editor) {
      return
    }
    const selection = editor.getSelection()
    if (!selection) {
      return
    }
    const decorations = editor.getDecorationsInRange(selection)
    const refDecoration = decorations?.find(d => d.options.inlineClassName === 'moquerie-code-editor-resource-ref')
    if (refDecoration) {
      editor.setSelection(refDecoration.range)
      selectRefShown.value = true
    }
  })
}

function formatCode() {
  editor?.getAction('editor.action.formatDocument')?.run()
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

              <Tooltip class="leading-[0]">
                <UButton
                  icon="i-ph-database"
                  variant="link"
                  :padded="false"
                  @click="selectRefShown = true"
                />

                <template #popper>
                  <div>Insert reference to instance</div>
                  <KbShortcut keys="meta_g" />
                </template>
              </Tooltip>
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
          <div class="flex items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/80">
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
        height: 'sm:h-[calc(100vh-200px)] sm:max-h-[900px]',
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

<style>
.moquerie-code-editor-resource-ref,
.moquerie-code-editor-resource-ref-icon {
  @apply bg-primary-500/20 dark:bg-primary-900/30 cursor-pointer;
}

.moquerie-code-editor-resource-ref-icon {
  @apply bg-no-repeat bg-center;
  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHBhdGggZmlsbD0iIzhiNWNmNiIgZD0ibTIyNy4zMSA3My4zN2wtNDQuNjgtNDQuNjlhMTYgMTYgMCAwIDAtMjIuNjMgMEwzNi42OSAxNTJBMTUuODYgMTUuODYgMCAwIDAgMzIgMTYzLjMxVjIwOGExNiAxNiAwIDAgMCAxNiAxNmg0NC42OWExNS44NiAxNS44NiAwIDAgMCAxMS4zMS00LjY5TDIyNy4zMSA5NmExNiAxNiAwIDAgMCAwLTIyLjYzWk05Mi42OSAyMDhINDh2LTQ0LjY5bDg4LTg4TDE4MC42OSAxMjBaTTE5MiAxMDguNjhMMTQ3LjMxIDY0bDI0LTI0TDIxNiA4NC42OFoiLz48L3N2Zz4=);
}
</style>
