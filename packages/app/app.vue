<template>
  <div class="h-screen flex dark:bg-black">
    <AppNav />
    <NuxtPage class="w-full h-full overflow-y-auto" />
  </div>

  <CommandPaletteModal />

  <UNotifications />
</template>
