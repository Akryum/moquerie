export const useCommandPaletteStore = defineStore('commandPalette', () => {
  const isOpen = ref(false)

  return {
    isOpen,
  }
})
