<script lang="ts" setup>
const filter = ref('')
</script>

<template>
  <div class="flex flex-col">
    <div class="p-1.5">
      <UInput
        v-model="filter"
        size="xs"
        placeholder="Filter factories by name, tag..."
        icon="i-ph-magnifying-glass"
        class="w-full"
        autocomplete="off"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #trailing>
          <UButton
            v-show="filter"
            icon="i-ph-backspace"
            color="gray"
            variant="link"
            size="xs"
            :padded="false"
            @click="filter = ''"
          />
        </template>
      </UInput>
    </div>

    <div class="flex-1 overflow-y-auto">
      List here
    </div>
  </div>
</template>
