/* Nested overlays inside instance value form */

export const isFakerOpen = ref(false)

export const isReferencesOpen = ref(false)

/**
 * Shortcuts on escape and meta_enter should be disabled if it's open.
 */
export const isAnyOpen = computed(() => isFakerOpen.value || isReferencesOpen.value)
