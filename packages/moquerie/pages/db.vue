<template>
  <div class="flex divide-x divide-gray-300 dark:divide-gray-700">
    <UVerticalNavigation
      :links="[
        {
          label: 'Resources',
          to: '/db/resources',
          icon: 'i-ph-table',
        },
        {
          label: 'Factories',
          to: '/db/factories',
          icon: 'i-ph-factory',
        },
        {
          label: 'Snapshots',
          to: '/db/snapshots',
          icon: 'i-ph-camera',
        },
        {
          label: 'History',
          to: '/db/history',
          icon: 'i-ph-clock-clockwise',
        },
      ]"
      class="my-1 mr-1 min-w-[160px]"
    />
    <NuxtPage class="w-full h-full" />
  </div>
</template>
