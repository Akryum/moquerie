<script lang="ts" setup>
const { data: projectData, refresh: refreshProjectData } = useFetch('/api/project')
onWindowFocus(refreshProjectData)

const commandPaletteStore = useCommandPaletteStore()
</script>

<template>
  <div class="flex items-center gap-2 p-1 border-b border-gray-300 dark:border-gray-700 text-sm">
    <div class="flex-1" />

    <button
      class="flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 rounded-md px-2 py-1 text-gray-500 hover:text-black dark:hover:text-white md:min-w-[400px]"
      @click="commandPaletteStore.isOpen = true"
    >
      <UIcon name="i-ph-magnifying-glass" class="w-4 h-4" />
      {{ projectData?.projectName }}
      <KbShortcut keys="meta_k" class="opacity-50" />
    </button>

    <BranchSelector />

    <div class="flex-1" />
  </div>
</template>
