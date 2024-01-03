<template>
  <div class="h-screen flex flex-col dark:bg-gray-900">
    <AppHeader class="flex-none" />
    <div class="flex flex-1 h-0">
      <AppNav />
      <NuxtPage class="flex-1 w-full overflow-y-auto" />
    </div>
  </div>

  <CommandPaletteModal />

  <UNotifications />
</template>
