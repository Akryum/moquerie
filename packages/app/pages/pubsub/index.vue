<script lang="ts" setup>
import { Tooltip } from 'floating-vue'
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

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: publish,
  },
})

function onEditorSetup(editor: monaco.editor.IStandaloneCodeEditor) {
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    publish()
  })
}

// History

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
</script>

<template>
  <div class="flex flex-col h-full p-4 gap-4">
    <h1 class="text-xl flex items-center gap-2 p-4">
      <UIcon name="i-ph-broadcast" class="w-5 h-5 flex-none text-primary-500" />
      Publish to a channel
    </h1>

    <div class="flex h-full flex-1 gap-8">
      <div class="flex flex-col gap-4 max-w-[600px] flex-1 h-full overflow-y-auto p-4">
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
          />
        </UFormGroup>

        <UFormGroup
          label="Payload"
        >
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
      <div class="flex flex-col flex-1 gap-2 overflow-y-auto p-4 pl-0 max-w-[800px]">
        <Tooltip
          v-for="(item, index) in history"
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
  </div>
</template>
