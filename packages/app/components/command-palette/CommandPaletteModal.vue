<script lang="ts" setup>
const commandPaletteStore = useCommandPaletteStore()

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      commandPaletteStore.isOpen = !commandPaletteStore.isOpen
    },
  },
})
</script>

<template>
  <UModal
    v-model="commandPaletteStore.isOpen"
    :ui="{
      container: 'sm:items-start',
    }"
  >
    <CommandPaletteContent
      @close="commandPaletteStore.isOpen = false"
    />
  </UModal>
</template>
