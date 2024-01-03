<template>
  <div class="h-screen flex flex-col dark:bg-black">
    <AppHeader />
    <div class="flex h-full">
      <AppNav />
      <NuxtPage class="w-full h-full overflow-y-auto" />
    </div>
  </div>

  <CommandPaletteModal />

  <UNotifications />
</template>
