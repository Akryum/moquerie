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
  <SimpleModal
    v-model="commandPaletteStore.isOpen"
  >
    <CommandPaletteContent
      @close="commandPaletteStore.isOpen = false"
    />
  </SimpleModal>
</template>
