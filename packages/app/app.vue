<template>
  <div class="h-screen flex flex-col dark:bg-gray-900">
    <AppHeader class="flex-none" />
    <div class="flex flex-1 h-0">
      <AppNav />
      <ErrorBoundary>
        <NuxtPage class="flex-1 w-full overflow-y-auto" />

        <template #error="{ error, clearError }">
          <div class="flex-1 flex flex-col gap-4 items-center justify-center p-12">
            <ErrorMessage :error="error" />
            <UButton icon="i-ph-house" @click="clearError({ redirect: '/' })">
              Go to home
            </UButton>
          </div>
        </template>
      </ErrorBoundary>
    </div>
  </div>

  <CommandPaletteModal />

  <UNotifications />
</template>
