<script lang="ts" setup>
import SuperJSON from 'superjson'

const { data, refresh } = await useFetch('/api/resources', {
  transform: data => SuperJSON.parse(data),
})
onWindowFocus(refresh)

const { copy } = useCopyToClipboard()
const toast = useToast()

function copyData() {
  copy(JSON.stringify(data.value, null, 2))
  toast.add({
    title: 'Copied to clipboard',
    icon: 'i-ph-check-square',
    color: 'green',
    timeout: 2000,
  })
}
</script>

<template>
  <div class="p-2 flex flex-col gap-2 max-w-[1000px] mx-auto">
    <Head>
      <Title>Debug Schema info</Title>
    </Head>

    <div class="flex items-center">
      <h1 class="text-xl text-primary-500 flex items-center gap-2">
        <UIcon name="i-ph-bug" class="w-6 h-6" />
        Debug Schema info
      </h1>
      <div class="flex-1" />
      <UButton
        icon="i-ph-clipboard"
        @click="copyData()"
      >
        Copy
      </UButton>
    </div>

    <MonacoEditor
      filename="debug-schema.json"
      :source="JSON.stringify(data, null, 2)"
      :options="{
        language: 'json',
        readOnly: true,
      }"
      class="flex-1"
    />
  </div>
</template>
