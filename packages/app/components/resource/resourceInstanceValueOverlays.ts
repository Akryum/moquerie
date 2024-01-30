/* Nested overlays inside instance value form */

import { isBranchesOpen } from '@/components/branch/branchOverlays.js'

export const isFakerOpen = ref(false)

export const isReferencesOpen = ref(false)

/**
 * Shortcuts on escape and meta_enter should be disabled if it's open.
 */
export const isAnyOpen = computed(() => isFakerOpen.value || isBranchesOpen.value || isReferencesOpen.value)
