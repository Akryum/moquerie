<script lang="ts" setup>
const { data: projectData, refresh: refreshProjectData } = useFetch('/api/project')
onWindowFocus(refreshProjectData)

const commandPaletteStore = useCommandPaletteStore()
</script>

<template>
  <div class="flex items-center h-11 gap-2 px-1 border-b border-gray-300 dark:border-gray-800 text-sm">
    <div class="flex-1" />

    <template v-if="!commandPaletteStore.isOpen">
      <button
        class="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-gray-500 hover:text-black dark:hover:text-white dark:bg-gray-800 h-8 md:min-w-[400px] group"
        @click="commandPaletteStore.isOpen = true"
      >
        <UIcon name="i-ph-magnifying-glass" class="w-4 h-4" />
        {{ projectData?.projectName }}
        <KbShortcut keys="meta_k" class="opacity-50 group-hover:opacity-100" />
      </button>

      <BranchSelector />
    </template>

    <div class="flex-1" />
  </div>
</template>
