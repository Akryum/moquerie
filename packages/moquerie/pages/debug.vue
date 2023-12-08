<script lang="ts" setup>
const { data, refresh } = await useFetch('/api/debug')
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
  <div class="p-2 flex flex-col gap-2">
    <Head>
      <Title>Debug info</Title>
    </Head>

    <div class="flex items-center">
      <h1 class="text-xl text-primary-500 flex items-center gap-2">
        <UIcon name="i-ph-bug" class="w-6 h-6" />
        Debug info
      </h1>
      <div class="flex-1" />
      <UButton
        icon="i-ph-clipboard"
        @click="copyData()"
      >
        Copy
      </UButton>
    </div>
    <pre class="p-2 bg-gray-500/10 rounded-lg text-xs overflow-y-auto">{{ data }}</pre>
  </div>
</template>
