<template>
  <div class="flex divide-x divide-gray-700">
    <UVerticalNavigation
      :links="[
        {
          label: 'Schema',
          to: './schema',
          icon: 'i-ph-tree-structure',
        },
        {
          label: 'Playground',
          to: './playground',
          icon: 'i-ph-play',
        },
      ]"
      class="my-1 mr-1 min-w-[160px]"
    />
    <NuxtPage class="w-full h-full" />
  </div>
</template>
