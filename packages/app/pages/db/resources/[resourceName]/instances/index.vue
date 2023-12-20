<template>
  <div class="text-center px-2 text-xs flex flex-col gap-2 justify-center items-center">
    <UIcon name="i-ph-arrow-bend-up-left" class="w-6 h-6 opacity-50 flex-none" />

    Select an instance

    <div class="space-y-2 mt-2">
      <div class="flex items-center gap-1">
        <KbShortcut keys="shift_Click" />
        Multiple select
      </div>

      <div class="flex items-center gap-1">
        <KbShortcut keys="meta_Click" />
        Pick select
      </div>
    </div>
  </div>
</template>
