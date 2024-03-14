<script lang="ts" setup>
import type { ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'

const props = defineProps<{
  resourceType: ResourceSchemaType
  childResourceType: ResourceSchemaType
  field: ResourceSchemaField & { type: 'resource' }
}>()

const emit = defineEmits<{
  cancel: []
  submit: [value: any]
}>()

function cancel() {
  emit('cancel')
}

const model = ref<any>()

function submit() {
  emit('submit', model.value)
}

// Field

const firstChildField = computed(() => Object.values(props.childResourceType.fields)[0]!)

// Shortcuts

defineShortcuts({
  escape: {
    usingInput: true,
    handler() {
      cancel()
    },
  },

  enter: {
    usingInput: true,
    handler() {
      submit()
    },
  },
})
</script>

<template>
  <div class="p-12 flex flex-col gap-6">
    <ResourceInstanceValueFormInput
      v-model="model"
      :resource-type="childResourceType"
      :field="{
        ...firstChildField,
        name: field.name,
      }"
    />

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <UButton
        color="gray"
        @click="cancel()"
      >
        Cancel

        <KbShortcut :keys="['escape']" />
      </UButton>

      <UButton
        color="primary"
        @click="submit()"
      >
        Apply new value

        <KbShortcut :keys="['enter']" />
      </UButton>
    </div>
  </div>
</template>
