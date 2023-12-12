<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  title?: string
  icon?: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

defineShortcuts({
  escape: {
    usingInput: true,
    handler: () => emit('cancel'),
    whenever: [() => props.modelValue],
  },

  enter: {
    usingInput: true,
    handler: () => emit('confirm'),
    whenever: [() => props.modelValue],
  },
})
</script>

<template>
  <UModal
    :model-value="modelValue"
  >
    <UCard>
      <template #header>
        <h2 class="text-lg font-bold flex items-center gap-2">
          <UIcon name="i-ph-factory" class="w-6 h-6" />
          {{ title }}
          <slot name="after-title" />
        </h2>
      </template>

      <slot />

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <UButton
          color="gray"
          @click="$emit('cancel')"
        >
          Cancel

          <KbShortcut :keys="['escape']" />
        </UButton>

        <UButton
          color="red"
          icon="i-ph-trash"
          @click="$emit('confirm')"
        >
          {{ confirmLabel ?? 'Confirm' }}

          <KbShortcut :keys="['enter']" />
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
