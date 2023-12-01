<template>
  <div class="flex divide-x divide-gray-700">
    <UVerticalNavigation
      :links="[
        {
          label: 'Resources',
          to: './resources',
          icon: 'i-ph-table',
        },
        {
          label: 'Factories',
          to: './factories',
          icon: 'i-ph-factory',
        },
        {
          label: 'Snapshots',
          to: './snapshots',
          icon: 'i-ph-camera',
        },
        {
          label: 'History',
          to: './history',
          icon: 'i-ph-clock-clockwise',
        },
      ]"
      class="my-1 mr-1 min-w-[160px]"
    />
    <NuxtPage class="w-full h-full" />
  </div>
</template>
